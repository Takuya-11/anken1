import { supabaseServer } from '@/lib/supabase'
import BroadcastClient from './BroadcastClient'

export const instant = false

export default async function BroadcastPage() {
  const { data: logs } = await supabaseServer
    .from('broadcast_logs')
    .select('id, message_text, sent_at')
    .order('sent_at', { ascending: false })
    .limit(20)

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">一斉配信</h2>
      <BroadcastClient logs={logs ?? []} />
    </div>
  )
}
