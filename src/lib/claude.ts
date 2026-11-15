import Anthropic from '@anthropic-ai/sdk'
import { supabaseServer } from './supabase'

const anthropic = new Anthropic()

export type Confidence = '高' | '中' | '低'

async function buildSystemPrompt(): Promise<string> {
  const [{ data: faqs }, { data: menus }] = await Promise.all([
    supabaseServer
      .from('faqs')
      .select('question, answer')
      .eq('is_active', true)
      .order('display_order'),
    supabaseServer
      .from('menu_items')
      .select('category, name, price, description')
      .eq('is_active', true)
      .order('display_order'),
  ])

  const faqText =
    faqs?.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join('\n\n') ?? ''

  const menuText =
    menus
      ?.map(
        (m) =>
          `${m.category} / ${m.name}: ¥${m.price}${m.description ? ` (${m.description})` : ''}`,
      )
      .join('\n') ?? ''

  const phone = process.env.SALON_PHONE ?? '店舗電話番号'

  return `あなたは美容室のカスタマーサポート AI です。
お客様の LINE メッセージに日本語で丁寧に回答してください。

## よくある質問と回答
${faqText}

## メニュー・料金
${menuText}

## 出力形式
必ず以下の JSON のみを返してください（前後に余分なテキスト不要）：
{"answer":"回答テキスト（200文字以内）","confidence":"高"}

## confidence の基準
- "高"：FAQ やメニューに直接該当し、確実に回答できる（例：営業時間・料金・駐車場）
- "中"：FAQ の内容でほぼ回答できるが、「髪の状態による」等の条件がある（例：同時施術可否）
- "低"：FAQ に全く該当しない、予約の確定受付、金銭トラブル・クレームなど人の判断が必要な内容のみ

## 重要なルール
- お客様はすでに LINE でメッセージを送っています。「LINE にてご連絡ください」とは絶対に言わないこと。
- スタッフへの連絡が必要な場合は、必ずお電話番号「${phone}」を案内してください。
- 電話番号はそのままテキストで書いてください（例：${phone}）。LINE アプリが自動でタップ発信リンクにします。`
}

export async function askClaude(
  userMessage: string,
): Promise<{ answer: string; confidence: Confidence }> {
  const systemPrompt = await buildSystemPrompt()

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 400,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })

  const raw =
    message.content[0].type === 'text' ? message.content[0].text.trim() : ''

  // Claude がコードブロック(```json ... ```)で包む場合を除去
  const cleaned = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim()

  try {
    const parsed = JSON.parse(cleaned) as { answer: string; confidence: Confidence }
    return {
      answer: parsed.answer ?? '',
      confidence: (['高', '中', '低'] as const).includes(parsed.confidence)
        ? parsed.confidence
        : '低',
    }
  } catch {
    // JSON パース失敗時は安全側（低）に倒してエスカレーション
    return { answer: 'ただいま確認中です。しばらくお待ちください。', confidence: '低' }
  }
}
