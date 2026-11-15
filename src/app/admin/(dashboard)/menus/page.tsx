import { supabaseServer } from '@/lib/supabase'
import MenusClient from './MenusClient'

export const instant = false

export default async function MenusPage() {
  const { data: items } = await supabaseServer
    .from('menu_items')
    .select('id, category, name, price, description, is_active')
    .order('display_order')

  return (
    <div className="space-y-4">
      <h2 className="text-base font-semibold text-gray-900">メニュー管理</h2>
      <MenusClient items={items ?? []} />
    </div>
  )
}
