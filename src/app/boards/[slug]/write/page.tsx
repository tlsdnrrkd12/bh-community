'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Board = {
  id: number
  name: string
  slug: string
}

export default function WritePostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.slug as string

  const [board, setBoard] = useState<Board | null>(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    const fetchBoard = async () => {
      const { data, error } = await supabase
        .from('boards')
        .select('id, name, slug')
        .eq('slug', slug)
        .single()

      if (error || !data) {
        setBoard(null)
      } else {
        setBoard(data)
      }

      setLoading(false)
    }

    if (slug) {
      fetchBoard()
    }
  }, [slug])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setMessage('')

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setMessage('로그인 후 글을 작성할 수 있습니다.')
        setSubmitting(false)
        return
      }

      if (!board) {
        setMessage('게시판 정보를 찾을 수 없습니다.')
        setSubmitting(false)
        return
      }

      if (!title.trim()) {
        setMessage('제목을 입력해주세요.')
        setSubmitting(false)
        return
      }

      if (!content.trim()) {
        setMessage('내용을 입력해주세요.')
        setSubmitting(false)
        return
      }

      const { error } = await supabase.from('posts').insert({
        board_id: board.id,
        user_id: user.id,
        title: title.trim(),
        content: content.trim(),
        is_notice: false,
        status: 'active',
      })

      if (error) {
        console.error(error)
        setMessage('글 저장 중 오류가 발생했습니다.')
        setSubmitting(false)
        return
      }

      router.push(`/boards/${slug}`)
      router.refresh()
    } catch (err) {
      console.error(err)
      setMessage('예상치 못한 오류가 발생했습니다.')
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-slate-500">게시판 정보를 불러오는 중...</p>
      </section>
    )
  }

  if (!board) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <h1 className="text-2xl font-bold mb-2">게시판을 찾을 수 없습니다.</h1>
        <p className="text-slate-500">존재하지 않는 게시판입니다.</p>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-sm text-slate-400 mb-2">/boards/{slug}/write</p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">
          {board.name} 글쓰기
        </h1>
        <p className="text-slate-500">
          커뮤니티에 공유할 내용을 자유롭게 작성해보세요.
        </p>
      </section>

      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              제목
            </label>
            <input
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              내용
            </label>
            <textarea
              placeholder="내용을 입력하세요"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[260px] rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition disabled:opacity-60"
            >
              {submitting ? '저장중...' : '등록'}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/boards/${slug}`)}
              className="px-5 py-3 rounded-xl border bg-white hover:bg-slate-100 transition"
            >
              취소
            </button>
          </div>

          {message && <p className="text-sm text-red-600">{message}</p>}
        </form>
      </section>
    </div>
  )
}