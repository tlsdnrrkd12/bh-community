'use client'

import Link from 'next/link'
import { FormEvent, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    })

    if (error) {
      setMessage(error.message)
    } else {
      setMessage('비밀번호 재설정 메일을 보냈습니다. 이메일을 확인해주세요.')
    }

    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-sm text-slate-400 mb-2">Account</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          비밀번호 찾기
        </h1>
        <p className="text-slate-500">
          가입한 이메일을 입력하면 비밀번호 재설정 링크를 보내드립니다.
        </p>
      </section>

      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              placeholder="가입한 이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-60"
            >
              {loading ? '전송 중...' : '재설정 메일 보내기'}
            </button>

            <Link
              href="/login"
              className="px-5 py-3 rounded-xl border bg-white hover:bg-slate-100 transition"
            >
              로그인으로 돌아가기
            </Link>
          </div>

          {message && <p className="text-sm text-slate-600">{message}</p>}
        </form>
      </section>
    </div>
  )
}