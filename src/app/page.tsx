'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Profile = {
  id: string
  email: string
  nickname: string
  role: string
}

export default function Home() {
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setProfile(null)
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, nickname, role')
        .eq('id', user.id)
        .single()

      if (!error) {
        setProfile(data)
      } else {
        setProfile(null)
      }

      setLoading(false)
    }

    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-white rounded-[28px] border border-slate-200 shadow-sm p-10">
        <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-indigo-100 blur-3xl" />
        <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-violet-100 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold mb-4">
            Community Platform
          </span>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight">
            BHCLUB
            <br />
            커뮤니티
          </h1>

          <p className="text-slate-500 text-lg max-w-2xl">

          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/boards"
              className="px-5 py-3 rounded-2xl bg-indigo-600 text-white hover:bg-indigo-500 transition shadow-md"
            >
              게시판 둘러보기
            </Link>

            {!loading && !profile && (
              <>
                <Link
                  href="/signup"
                  className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  회원가입
                </Link>
                <Link
                  href="/login"
                  className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition"
                >
                  로그인
                </Link>
              </>
            )}

            {!loading && profile && (
              <button
                onClick={handleLogout}
                className="px-5 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 transition"
              >
                로그아웃
              </button>
            )}
          </div>
        </div>
      </section>

      {!loading && profile && (
        <section className="grid md:grid-cols-2 gap-6">
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-400 mb-2">현재 로그인</p>
            <p className="text-2xl font-semibold">{profile.nickname}님</p>
            <p className="text-slate-500 mt-2">
              오늘도 커뮤니티 활동을 시작해보세요.
            </p>
          </div>

          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <p className="text-sm text-slate-400 mb-2">빠른 이동</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Link
                href="/boards/free"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                자유게시판
              </Link>
              <Link
                href="/boards/notice"
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 transition"
              >
                공지사항
              </Link>
            </div>
          </div>
        </section>
      )}

      <section className="grid md:grid-cols-2 gap-6">
        <Link
          href="/boards/free"
          className="group relative overflow-hidden bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-100 rounded-full blur-2xl opacity-70" />

          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold mb-4">
              Free Board
            </span>
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-indigo-600 transition">
              자유게시판
            </h2>
            <p className="text-slate-500">

            </p>
          </div>
        </Link>

        <Link
          href="/boards/notice"
          className="group relative overflow-hidden bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition"
        >
          <div className="absolute top-0 right-0 h-24 w-24 bg-violet-100 rounded-full blur-2xl opacity-70" />

          <div className="relative">
            <span className="inline-flex items-center rounded-full bg-violet-100 text-violet-700 px-3 py-1 text-xs font-semibold mb-4">
              Notice
            </span>
            <h2 className="text-2xl font-semibold mb-2 group-hover:text-violet-600 transition">
              공지사항
            </h2>
            <p className="text-slate-500">

            </p>
          </div>
        </Link>
      </section>
    </div>
  )
}