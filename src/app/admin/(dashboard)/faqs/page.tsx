import { supabaseServer } from '@/lib/supabase'
import FaqsClient from './FaqsClient'

export const instant = false

export default async function FaqsPage() {
  const { data: faqs } = await supabaseServer
    .from('faqs')
    .select('id, question, answer, is_active')
    .order('display_order')

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">FAQ 管理</h2>
      <FaqsClient faqs={faqs ?? []} />
    </div>
  )
}
