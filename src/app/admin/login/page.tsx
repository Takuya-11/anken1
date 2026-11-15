'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase-browser'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${location.origin}/admin/auth/callback`,
      },
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-sm p-8">
        <h1 className="text-xl font-bold text-gray-900 mb-1">管理画面</h1>
        <p className="text-sm text-gray-500 mb-6">
          登録済みのメールアドレスを入力してください
        </p>

        {sent ? (
          <div className="text-center space-y-2">
            <p className="text-green-600 font-medium">✉️ メールを送信しました</p>
            <p className="text-sm text-gray-500">
              届いたリンクをタップしてログインしてください
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="email"
              required
              placeholder="メールアドレス"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50"
            >
              {loading ? '送信中...' : 'ログインリンクを送る'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
