/**
 * Bot 動作テスト — ローカルで askClaude を直接呼び出して確認
 * 実行: npm run test:bot
 */
import { askClaude } from '../src/lib/claude'

type TestCase = {
  label: string
  message: string
  expectedConfidence?: '高' | '中' | '低'
}

const cases: TestCase[] = [
  // --- FAQ パターン ---
  { label: '営業時間',      message: '営業時間を教えてください',           expectedConfidence: '高' },
  { label: 'メニュー料金',  message: 'カットの料金はいくらですか？',         expectedConfidence: '高' },
  { label: 'アクセス/駐車場', message: '駐車場はありますか？',              expectedConfidence: '高' },
  { label: '予約方法',      message: '予約はどうすればいいですか？',         expectedConfidence: '高' },
  { label: '施術組合せ',    message: 'カラーとパーマを同じ日にできますか？', expectedConfidence: '中' },
  // --- エスカレーション ---
  { label: '返金要求',      message: '先日の施術が気に入らないので返金してほしい', expectedConfidence: '低' },
  { label: '予約確定',      message: '明日の14時に予約を確定させてください', expectedConfidence: '低' },
  // --- エッジケース ---
  { label: '長文メッセージ', message: 'こんにちは！先日友達からこちらの美容室を紹介してもらいました。初めてなのですが、カットとカラーを一緒にお願いしたいです。料金はだいたいいくらくらいになりますか？また、予約はどのようにすればよいでしょうか？駐車場はありますか？色々聞いてしまってすみません。' },
  { label: '絵文字のみ',    message: '😊💇✨' },
  { label: '短い一言',      message: 'ねだん' },
  { label: '英語混じり',    message: 'What time do you open?' },
]

const TIMEOUT_MS = 10_000  // 10秒を超えたら警告

async function run() {
  console.log('='.repeat(60))
  console.log('Bot テスト開始')
  console.log('='.repeat(60))

  let pass = 0
  let warn = 0
  let fail = 0

  for (const c of cases) {
    const start = Date.now()
    let result: Awaited<ReturnType<typeof askClaude>>

    try {
      result = await askClaude(c.message)
    } catch (err) {
      console.log(`\n❌ [${c.label}] 例外が発生`)
      console.log('   エラー:', err)
      fail++
      continue
    }

    const elapsed = Date.now() - start
    const timeLabel = elapsed > TIMEOUT_MS ? `⚠️  ${elapsed}ms` : `${elapsed}ms`

    const confidenceOk =
      !c.expectedConfidence || result.confidence === c.expectedConfidence

    const icon = !confidenceOk ? '⚠️ ' : elapsed > TIMEOUT_MS ? '⏱️ ' : '✅'

    console.log(`\n${icon} [${c.label}] (${timeLabel})`)
    console.log(`   入力: ${c.message.slice(0, 50)}${c.message.length > 50 ? '…' : ''}`)
    console.log(`   確信度: ${result.confidence}${c.expectedConfidence ? ` (期待: ${c.expectedConfidence})` : ''}`)
    console.log(`   回答: ${result.answer.slice(0, 80)}${result.answer.length > 80 ? '…' : ''}`)

    if (!confidenceOk) {
      warn++
    } else if (elapsed > TIMEOUT_MS) {
      warn++
    } else {
      pass++
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log(`結果: ✅ ${pass} 件成功 / ⚠️  ${warn} 件要確認 / ❌ ${fail} 件失敗`)
  console.log('='.repeat(60))
}

run().catch(console.error)
