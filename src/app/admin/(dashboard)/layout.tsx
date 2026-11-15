export const instant = false

import Link from 'next/link'
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { redirect } from 'next/navigation'
import LogoutButton from './LogoutButton'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          )
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/admin/login')

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-bold text-gray-900">管理画面</span>
          <LogoutButton />
        </div>
      </header>

      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-lg mx-auto px-4 flex gap-6">
          {[
            { href: '/admin/faqs', label: 'FAQ' },
            { href: '/admin/menus', label: 'メニュー' },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="py-3 text-sm font-medium text-gray-600 border-b-2 border-transparent hover:text-indigo-600 hover:border-indigo-600 transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      </nav>

      <main className="max-w-lg mx-auto px-4 py-6">{children}</main>
    </div>
  )
}
