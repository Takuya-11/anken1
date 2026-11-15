/**
 * Webhook エッジケーステスト
 * スタンプ・空文字・不正リクエストを本番 Webhook に直接 POST して挙動を確認
 */
import crypto from 'crypto'

const WEBHOOK_URL = 'https://anken1.vercel.app/api/webhook'
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET!

function sign(body: string) {
  return crypto
    .createHmac('sha256', CHANNEL_SECRET)
    .update(body)
    .digest('base64')
}

function makeEvent(overrides: Record<string, unknown>) {
  return {
    destination: 'Utest',
    events: [
      {
        type: 'message',
        mode: 'active',
        timestamp: Date.now(),
        source: { type: 'user', userId: 'Utest_user' },
        replyToken: 'test_reply_token_will_fail_gracefully',
        webhookEventId: 'test',
        deliveryContext: { isRedelivery: false },
        ...overrides,
      },
    ],
  }
}

type TestCase = {
  label: string
  body: Record<string, unknown>
  expectStatus: number
  note: string
}

const cases: TestCase[] = [
  {
    label: 'スタンプ',
    body: makeEvent({ message: { id: '1', type: 'sticker', stickerId: '1', packageId: '1' } }),
    expectStatus: 200,
    note: '無視されて 200 を返すこと',
  },
  {
    label: '画像メッセージ',
    body: makeEvent({ message: { id: '2', type: 'image' } }),
    expectStatus: 200,
    note: '無視されて 200 を返すこと',
  },
  {
    label: 'follow イベント',
    body: { destination: 'Utest', events: [{ type: 'follow', mode: 'active', timestamp: Date.now(), source: { type: 'user', userId: 'Utest_user' }, webhookEventId: 'test', deliveryContext: { isRedelivery: false } }] },
    expectStatus: 200,
    note: '無視されて 200 を返すこと',
  },
  {
    label: '不正署名',
    body: makeEvent({ message: { id: '3', type: 'text', text: 'hello' } }),
    expectStatus: 401,
    note: '署名が不正なら 401 を返すこと',
  },
  {
    label: 'events 空配列',
    body: { destination: 'Utest', events: [] },
    expectStatus: 200,
    note: 'イベントなしでも 200 を返すこと',
  },
]

async function run() {
  console.log('='.repeat(60))
  console.log('Webhook エッジケーステスト')
  console.log('='.repeat(60))

  let pass = 0
  let fail = 0

  for (const c of cases) {
    const bodyStr = JSON.stringify(c.body)
    const correctSig = sign(bodyStr)
    const sig = c.label === '不正署名' ? 'invalidsig==' : correctSig

    const start = Date.now()
    let status: number
    try {
      const res = await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-line-signature': sig,
        },
        body: bodyStr,
      })
      status = res.status
    } catch (err) {
      console.log(`\n❌ [${c.label}] fetch エラー: ${err}`)
      fail++
      continue
    }

    const elapsed = Date.now() - start
    const ok = status === c.expectStatus
    const icon = ok ? '✅' : '❌'

    console.log(`\n${icon} [${c.label}] ${elapsed}ms`)
    console.log(`   期待: ${c.expectStatus} / 実際: ${status}`)
    console.log(`   ${c.note}`)

    ok ? pass++ : fail++
  }

  console.log('\n' + '='.repeat(60))
  console.log(`結果: ✅ ${pass} 件成功 / ❌ ${fail} 件失敗`)
  console.log('='.repeat(60))
}

run().catch(console.error)
