'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) {
        setMessage(error.message)
        setLoading(false)
        return
      }

      const user = data.user
      if (!user) {
        setMessage('회원가입은 되었지만 사용자 정보를 확인할 수 없습니다.')
        setLoading(false)
        return
      }

      const { error: profileError } = await supabase.from('profiles').insert({
        id: user.id,
        email,
        nickname,
        role: 'user',
      })

      if (profileError) {
        setMessage(profileError.message)
        setLoading(false)
        return
      }

      router.push('/login')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-sm text-slate-400 mb-2">Account</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">회원가입</h1>
        <p className="text-slate-500">
          새 계정을 만들고 커뮤니티 활동을 시작해보세요.
        </p>
      </section>

      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <form onSubmit={handleSignup} className="space-y-5">
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

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              닉네임
            </label>
            <input
              type="text"
              placeholder="닉네임을 입력하세요"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
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
              {loading ? '가입 중...' : '회원가입'}
            </button>

            <Link
              href="/login"
              className="px-5 py-3 rounded-xl border bg-white hover:bg-slate-100 transition"
            >
              로그인
            </Link>
          </div>

          {message && <p className="text-sm text-red-600">{message}</p>}
        </form>
      </section>
    </div>
  )
}