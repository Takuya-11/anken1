'use client'
import { useState } from 'react'
import { sendBroadcast } from './actions'

type BroadcastLog = {
  id: string
  message_text: string
  sent_at: string
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ja-JP', {
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function BroadcastClient({ logs }: { logs: BroadcastLog[] }) {
  const [step, setStep] = useState<'input' | 'confirm'>('input')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSend() {
    setSending(true)
    setError('')
    try {
      await sendBroadcast(message)
      setMessage('')
      setStep('input')
      setDone(true)
      setTimeout(() => setDone(false), 4000)
    } catch (e) {
      setError(e instanceof Error ? e.message : '送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-6">
      {done && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-xl px-4 py-3">
          送信しました
        </div>
      )}

      {step === 'input' ? (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <h3 className="text-sm font-semibold text-gray-900">メッセージを作成</h3>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="お知らせ内容を入力してください"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
          <p className="text-xs text-gray-400">
            LINE 友だち全員（約300人）に送信されます
          </p>
          <button
            onClick={() => {
              if (message.trim()) setStep('confirm')
            }}
            disabled={!message.trim()}
            className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-40"
          >
            内容を確認する
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-indigo-300 p-4 space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">送信内容の確認</h3>
          <div className="bg-gray-50 rounded-lg px-4 py-3 text-sm text-gray-900 whitespace-pre-wrap">
            {message}
          </div>
          <p className="text-xs text-gray-500">
            この内容を LINE 友だち全員に送信します。送信後は取り消せません。
          </p>
          {error && (
            <p className="text-xs text-red-600">{error}</p>
          )}
          <div className="flex gap-2">
            <button
              onClick={() => { setStep('input'); setError('') }}
              disabled={sending}
              className="flex-1 bg-gray-100 text-gray-700 rounded-xl py-3 text-sm font-medium"
            >
              修正する
            </button>
            <button
              onClick={handleSend}
              disabled={sending}
              className="flex-1 bg-indigo-600 text-white rounded-xl py-3 text-sm font-semibold disabled:opacity-50"
            >
              {sending ? '送信中...' : '送信する'}
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-3">配信履歴</h3>
        {logs.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-6">
            まだ配信履歴がありません
          </p>
        ) : (
          <ul className="space-y-3">
            {logs.map((log) => (
              <li
                key={log.id}
                className="bg-white rounded-xl border border-gray-200 p-4 space-y-1"
              >
                <p className="text-xs text-gray-400">{formatDate(log.sent_at)}</p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-3">
                  {log.message_text}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
