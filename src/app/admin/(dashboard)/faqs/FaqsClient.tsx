'use client'
import { useState } from 'react'
import { createFaq, updateFaq, deleteFaq, toggleFaqActive } from './actions'

type Faq = {
  id: string
  question: string
  answer: string
  is_active: boolean
}

function FaqItem({ faq }: { faq: Faq }) {
  const [editing, setEditing] = useState(false)

  if (editing) {
    return (
      <li className="bg-white rounded-xl border border-indigo-200 p-4 space-y-3">
        <form
          action={async (fd) => {
            await updateFaq(faq.id, fd)
            setEditing(false)
          }}
          className="space-y-3"
        >
          <input
            name="question"
            defaultValue={faq.question}
            required
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="質問"
          />
          <textarea
            name="answer"
            defaultValue={faq.answer}
            required
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
            placeholder="回答"
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
        <p className="text-sm font-medium text-gray-900">{faq.question}</p>
        <span
          className={`shrink-0 text-xs px-2 py-0.5 rounded-full ${
            faq.is_active
              ? 'bg-green-100 text-green-700'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {faq.is_active ? '有効' : '無効'}
        </span>
      </div>
      <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
      <div className="flex gap-2 pt-2">
        <button
          onClick={() => setEditing(true)}
          className="text-xs text-indigo-600 hover:underline"
        >
          編集
        </button>
        <button
          onClick={() => toggleFaqActive(faq.id, !faq.is_active)}
          className="text-xs text-gray-500 hover:underline"
        >
          {faq.is_active ? '無効化' : '有効化'}
        </button>
        <button
          onClick={async () => {
            if (confirm('削除しますか？')) await deleteFaq(faq.id)
          }}
          className="text-xs text-red-500 hover:underline ml-auto"
        >
          削除
        </button>
      </div>
    </li>
  )
}

function NewFaqForm() {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full bg-indigo-600 text-white rounded-xl py-3 text-sm font-medium"
      >
        + FAQ を追加
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-indigo-200 p-4 space-y-3">
      <p className="text-sm font-medium text-gray-900">新しい FAQ</p>
      <form
        action={async (fd) => {
          await createFaq(fd)
          setOpen(false)
        }}
        className="space-y-3"
      >
        <input
          name="question"
          required
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="質問"
        />
        <textarea
          name="answer"
          required
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          placeholder="回答"
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

export default function FaqsClient({ faqs }: { faqs: Faq[] }) {
  return (
    <div className="space-y-4">
      <NewFaqForm />
      {faqs.length === 0 ? (
        <p className="text-center text-sm text-gray-400 py-8">
          まだ FAQ がありません
        </p>
      ) : (
        <ul className="space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq.id} faq={faq} />
          ))}
        </ul>
      )}
    </div>
  )
}
