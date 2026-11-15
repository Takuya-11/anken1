import { NextRequest, NextResponse } from 'next/server'
import { validateSignature, messagingApi, webhook } from '@line/bot-sdk'
import { askClaude } from '@/lib/claude'
import { supabaseServer } from '@/lib/supabase'

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
})

export async function POST(req: NextRequest) {
  const body = await req.text()
  const signature = req.headers.get('x-line-signature') ?? ''

  if (!validateSignature(body, process.env.LINE_CHANNEL_SECRET!, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
  }

  const { events } = JSON.parse(body) as webhook.CallbackRequest

  await Promise.allSettled(events.map(handleEvent))

  return NextResponse.json({ ok: true })
}

async function handleEvent(event: webhook.Event) {
  if (event.type !== 'message') return
  const msg = (event as webhook.MessageEvent).message
  if (msg.type !== 'text') return

  const textMsg = msg as webhook.TextMessageContent
  const replyToken = (event as webhook.MessageEvent).replyToken
  const userId = event.source?.userId ?? ''

  const { answer, confidence } = await askClaude(textMsg.text)

  // 確信度に関わらずお客様には常に回答を返す
  const replyPromise =
    replyToken
      ? lineClient.replyMessage({
          replyToken,
          messages: [{ type: 'text', text: answer }],
        })
      : Promise.resolve()

  if (confidence === '低') {
    // 確信度が低い場合のみオーナーに通知 + ログ記録
    await Promise.all([
      replyPromise,
      lineClient.pushMessage({
        to: process.env.LINE_OWNER_USER_ID!,
        messages: [
          {
            type: 'text',
            text: `⚠️ 確信度【低】の問い合わせ（要確認）\n\n質問：「${textMsg.text}」\nAI 回答：「${answer}」`,
          },
        ],
      }),
      supabaseServer.from('escalation_logs').insert({
        line_user_id: userId,
        message_text: textMsg.text,
      }),
    ])
  } else {
    await replyPromise
  }
}
