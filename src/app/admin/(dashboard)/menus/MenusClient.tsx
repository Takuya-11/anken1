'use client'
import { useState } from 'react'
import {
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  toggleMenuActive,
} from './actions'

type MenuItem = {
  id: string
  category: string
  name: string
  price: number
  description: string | null
  is_active: boolean
}

function MenuItemRow({ item }: { item: MenuItem }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="bg-white rounded-xl border border-indigo-200 p-4 space-y-3">
        <form
          action={async (fd) => {
            await updateMenuItem(item.id, fd)
            setEditing(false)
          }}
          className="space-y-3"
        >
          <div className="flex gap-2">
            <input
              name="category"
              defaultValue={item.category}
              required
              placeholder="カテゴリ"
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <input
              name="name"
              defaultValue={item.name}
              required
              placeholder="メニュー名"
              className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <input
            name="price"
            type="number"
            defaultValue={item.price}
            required
            placeholder="料金（円）"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="description"
            defaultValue={item.description ?? ''}
            placeholder="説明（任意）"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium"
            >
              保存
            </button>
            <button
              type="button"
              onClick={() => setEditing(false)}
              className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm"
            >
              キャンセル
            </button>
          </div>
        </form>
      </li>
    )
  }

  return (
    <li className="bg-white rounded-xl border border-gray-200 p-4 space-y-1">
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-xs text-indigo-600 font-medium">
            {item.category}
          </span>
          <p className="text-sm font-medium text-gray-900">{item.name}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-gray-900">
            ¥{item.price.toLocaleString()}
          </p>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              item.is_active
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {item.is_active ? '有効' : '無効'}
          </span>
        </div>
      </div>
      {item.description && (
        <p className="text-xs text-gray-400">{item.description}</p>
      )}
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-indigo-600 hover:underline"
        >
          編集
        </button>
        <button
          onClick={() => toggleMenuActive(item.id, !item.is_active)}
          className="text-xs text-gray-500 hover:underline"
        >
          {item.is_active ? '無効化' : '有効化'}
        </button>
        <button
          onClick={async () => {
            if (confirm('削除しますか？')) await deleteMenuItem(item.id)
          }}
          className="text-xs text-red-500 hover:underline ml-auto"
        >
          削除
        </button>
      </div>
    </li>
  )
}

function NewMenuForm() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-medium"
      >
        + メニューを追加
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-indigo-200 p-4 space-y-3">
      <p className="text-sm font-medium text-gray-900">新しいメニュー</p>
      <form
        action={async (fd) => {
          await createMenuItem(fd)
          setOpen(false)
        }}
        className="space-y-3"
      >
        <div className="flex gap-2">
          <input
            name="category"
            required
            placeholder="カテゴリ（例: カット）"
            className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <input
            name="name"
            required
            placeholder="メニュー名"
            className="w-1/2 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>
        <input
          name="price"
          type="number"
          required
          placeholder="料金（円）"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <input
          name="description"
          placeholder="説明（任意）"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
        />
        <div className="flex gap-2">
          <button
            type="submit"
            className="flex-1 bg-indigo-600 text-white rounded-lg py-2 text-sm font-medium"
          >
            追加
          </button>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="flex-1 bg-gray-100 text-gray-700 rounded-lg py-2 text-sm"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  )
}

export default function MenusClient({ items }: { items: MenuItem[] }) {
  const categories = [...new Set(items.map((i) => i.category))]

  return (
    <div className="space-y-4">
      <NewMenuForm />
      {items.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">
          まだメニューがありません
        </p>
      ) : (
        categories.map((cat) => (
          <div key={cat}>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
              {cat}
            </p>
            <ul className="space-y-3">
              {items
                .filter((i) => i.category === cat)
                .map((item) => (
                  <MenuItemRow key={item.id} item={item} />
                ))}
            </ul>
          </div>
        ))
      )}
    </div>
  )
}
