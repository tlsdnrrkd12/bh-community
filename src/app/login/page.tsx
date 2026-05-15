'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      router.push('/')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-sm text-slate-400 mb-2">Account</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">로그인</h1>
        <p className="text-slate-500">
          가입한 계정으로 로그인해서 글 작성과 댓글 기능을 이용해보세요.
        </p>
      </section>

      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              이메일
            </label>
            <input
              type="email"
              placeholder="이메일을 입력하세요"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              비밀번호
            </label>
            <input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
              required
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition disabled:opacity-60"
            >
              {loading ? '로그인 중...' : '로그인'}
            </button>

            <Link
              href="/signup"
              className="px-5 py-3 rounded-xl border bg-white hover:bg-slate-100 transition"
            >
              회원가입
            </Link>
<Link href="/forgot-password" className="text-sm text-indigo-600 hover:underline">
  비밀번호를 잊으셨나요?
</Link>
          </div>

          {message && <p className="text-sm text-red-600">{message}</p>}
        </form>
      </section>
    </div>
  )
}