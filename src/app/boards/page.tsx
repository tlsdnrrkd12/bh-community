'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'

type Board = {
  id: number
  name: string
  slug: string
  description: string | null
  is_active: boolean
  created_at: string
}

export default function BoardsPage() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getBoards = async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('*')
        .eq('is_active', true)
        .order('id', { ascending: true })

      if (error) {
        console.error('boards 조회 에러:', error)
        setBoards([])
      } else {
        setBoards(data ?? [])
      }

      setLoading(false)
    }

    getBoards()
  }, [])

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden bg-white rounded-[28px] border border-slate-200 shadow-sm p-8">
        <div className="absolute -top-10 -right-10 h-36 w-36 rounded-full bg-indigo-100 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 px-3 py-1 text-xs font-semibold mb-4">
            Community Boards
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-3">
            게시판
          </h1>
          <p className="text-slate-500">
            원하는 게시판으로 이동해서 글을 읽고, 작성하고, 소통해보세요.
          </p>
        </div>
      </section>

      <section className="grid gap-5">
        {loading ? (
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <p className="text-slate-500">게시판을 불러오는 중...</p>
          </div>
        ) : boards.length === 0 ? (
          <div className="bg-white rounded-[24px] border border-slate-200 shadow-sm p-6">
            <p className="text-slate-500">등록된 게시판이 없습니다.</p>
          </div>
        ) : (
          boards.map((board) => (
            <Link
              key={board.id}
              href={`/boards/${board.slug}`}
              className="group relative overflow-hidden bg-white rounded-[24px] border border-slate-200 shadow-sm p-6 hover:shadow-lg hover:-translate-y-1 transition"
            >
              <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-50 rounded-full blur-2xl opacity-80" />

              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-400 mb-2">
                    /boards/{board.slug}
                  </p>
                  <h2 className="text-xl font-semibold text-slate-900 group-hover:text-indigo-600 transition">
                    {board.name}
                  </h2>
                  <p className="text-slate-500 mt-2">
                    {board.description ?? '게시판 설명이 없습니다.'}
                  </p>
                </div>

                <div className="shrink-0 text-slate-400 group-hover:text-indigo-600 transition text-lg">
                  →
                </div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}