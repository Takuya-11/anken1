'use server'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase'

export async function sendBroadcast(message: string) {
  const res = await fetch('https://api.line.me/v2/bot/message/broadcast', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messages: [{ type: 'text', text: message }],
    }),
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? '送信に失敗しました')
  }

  await supabaseServer.from('broadcast_logs').insert({ message_text: message })
  revalidatePath('/admin/broadcast')
}
