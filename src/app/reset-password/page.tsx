'use client'

import { FormEvent, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [passwordConfirm, setPasswordConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')

    if (password.length < 6) {
      setMessage('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (password !== passwordConfirm) {
      setMessage('비밀번호 확인이 일치하지 않습니다.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    if (error) {
      setMessage(error.message)
      setLoading(false)
      return
    }

    setMessage('비밀번호가 변경되었습니다. 다시 로그인해주세요.')

    await supabase.auth.signOut()

    setTimeout(() => {
      router.push('/login')
    }, 1200)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-sm text-slate-400 mb-2">Account</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          새 비밀번호 설정
        </h1>
        <p className="text-slate-500">
          새로 사용할 비밀번호를 입력해주세요.
        </p>
      </section>

      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              새 비밀번호
            </label>
            <input
              type="password"
              placeholder="새 비밀번호"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              새 비밀번호 확인
            </label>
            <input
              type="password"
              placeholder="새 비밀번호 확인"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              className="w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-200"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 rounded-xl bg-indigo-600 text-white hover:bg-indigo-500 transition disabled:opacity-60"
          >
            {loading ? '변경 중...' : '비밀번호 변경'}
          </button>

          {message && <p className="text-sm text-slate-600">{message}</p>}
        </form>
      </section>
    </div>
  )
}