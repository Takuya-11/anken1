'use server'
import { revalidatePath } from 'next/cache'
import { supabaseServer } from '@/lib/supabase'

export async function createFaq(formData: FormData) {
  const question = formData.get('question') as string
  const answer = formData.get('answer') as string
  await supabaseServer.from('faqs').insert({ question, answer })
  revalidatePath('/admin/faqs')
}

export async function updateFaq(id: string, formData: FormData) {
  const question = formData.get('question') as string
  const answer = formData.get('answer') as string
  await supabaseServer.from('faqs').update({ question, answer }).eq('id', id)
  revalidatePath('/admin/faqs')
}

export async function deleteFaq(id: string) {
  await supabaseServer.from('faqs').delete().eq('id', id)
  revalidatePath('/admin/faqs')
}

export async function toggleFaqActive(id: string, isActive: boolean) {
  await supabaseServer
    .from('faqs')
    .update({ is_active: isActive })
    .eq('id', id)
  revalidatePath('/admin/faqs')
}
