import { supabaseServer } from '@/lib/supabase'

export const instant = false

const confidenceStyle: Record<string, string> = {
  高: 'bg-green-100 text-green-700',
  中: 'bg-yellow-100 text-yellow-700',
  低: 'bg-red-100 text-red-700',
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default async function LogsPage() {
  const { data: logs } = await supabaseServer
    .from('conversations')
    .select('id, user_message, bot_answer, confidence, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">会話ログ</h2>
      {!logs || logs.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">
          まだ会話ログがありません
        </p>
      ) : (
        <ul className="space-y-3">
          {logs.map((log) => (
            <li
              key={log.id}
              className="bg-white rounded-xl border border-gray-200 p-4 space-y-2"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs text-gray-400">
                  {formatDate(log.created_at)}
                </span>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    confidenceStyle[log.confidence] ?? 'bg-gray-100 text-gray-500'
                  }`}
                >
                  確信度 {log.confidence}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">お客様</p>
                <p className="text-sm text-gray-900 bg-gray-50 rounded-lg px-3 py-2">
                  {log.user_message}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-gray-500">AI 回答</p>
                <p className="text-sm text-gray-700 bg-indigo-50 rounded-lg px-3 py-2">
                  {log.bot_answer}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
