'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type Board = {
  id: number
  name: string
  slug: string
  description: string | null
}

type Post = {
  id: number
  title: string
  created_at: string
  user_id: string
  profiles: {
    nickname: string
  } | null
}

export default function BoardDetailPage() {
  const params = useParams()
  const slug = params.slug as string

  const [board, setBoard] = useState<Board | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return

    const fetchData = async () => {
      setLoading(true)

      const { data: boardData, error: boardError } = await supabase
        .from('boards')
        .select('id, name, slug, description')
        .eq('slug', slug)
        .single()

      if (boardError || !boardData) {
        setBoard(null)
        setPosts([])
        setLoading(false)
        return
      }

      setBoard(boardData)

      const { data: postData, error: postError } = await supabase
        .from('posts')
        .select(`
          id,
          title,
          created_at,
          user_id,
          profiles (
            nickname
          )
        `)
        .eq('board_id', boardData.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (postError) {
        console.error('게시글 조회 실패:', postError)
        setPosts([])
      } else {
       setPosts((postData ?? []) as unknown as Post[])
      }

      setLoading(false)
    }

    fetchData()
  }, [slug])

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border shadow-sm p-8">
          <p className="text-slate-500">게시판 정보를 불러오는 중...</p>
        </section>
      </div>
    )
  }

  if (!board) {
    return (
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">게시판을 찾을 수 없습니다.</h1>
          <p className="text-slate-500">존재하지 않거나 비활성화된 게시판입니다.</p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <p className="text-sm text-slate-400 mb-2">/boards/{board.slug}</p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">
              {board.name}
            </h1>
            <p className="text-slate-500">
              {board.description ?? '게시판 설명이 없습니다.'}
            </p>
          </div>

          <Link
            href={`/boards/${slug}/write`}
            className="inline-flex items-center justify-center px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition"
          >
            글쓰기
          </Link>
        </div>
      </section>

      <section className="space-y-4">
        {posts.length === 0 ? (
          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <p className="text-slate-500">아직 작성된 글이 없습니다.</p>
          </div>
        ) : (
          posts.map((post) => (
            <Link
              key={post.id}
              href={`/boards/${slug}/${post.id}`}
              className="block bg-white rounded-2xl border shadow-sm p-6 hover:shadow-md hover:-translate-y-0.5 transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-slate-900 truncate">
                    {post.title}
                  </h2>
                  <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                    <span>작성자: {post.profiles?.nickname ?? '알 수 없음'}</span>
                    <span>·</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="shrink-0 text-slate-400">→</div>
              </div>
            </Link>
          ))
        )}
      </section>
    </div>
  )
}