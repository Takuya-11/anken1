'use server'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase'

export async function createMenuItem(formData: FormData) {
  await supabaseServer.from('menu_items').insert({
    category: formData.get('category') as string,
    name: formData.get('name') as string,
    price: Number(formData.get('price')),
    description: formData.get('description') as string || null,
  })
  revalidatePath('/admin/menus')
}

export async function updateMenuItem(id: string, formData: FormData) {
  await supabaseServer
    .from('menu_items')
    .update({
      category: formData.get('category') as string,
      name: formData.get('name') as string,
      price: Number(formData.get('price')),
      description: formData.get('description') as string || null,
    })
    .eq('id', id)
  revalidatePath('/admin/menus')
}

export async function deleteMenuItem(id: string) {
  await supabaseServer.from('menu_items').delete().eq('id', id)
  revalidatePath('/admin/menus')
}

export async function toggleMenuActive(id: string, isActive: boolean) {
  await supabaseServer
    .from('menu_items')
    .update({ is_active: isActive })
    .eq('id', id)
  revalidatePath('/admin/menus')
}
