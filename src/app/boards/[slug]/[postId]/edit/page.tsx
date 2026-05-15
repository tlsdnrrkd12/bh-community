'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

type Post = {
  id: number
  title: string
  content: string
  user_id: string
  status: string
}

export default function EditPostPage() {
  const params = useParams()
  const router = useRouter()

  const slug = params.slug as string
  const postId = params.postId as string

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [post, setPost] = useState<Post | null>(null)

  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true)

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError || !user) {
        setMessage('로그인 후 수정할 수 있습니다.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('posts')
        .select('id, title, content, user_id, status')
        .eq('id', postId)
        .eq('status', 'active')
        .single()

      if (error || !data) {
        setMessage('글을 찾을 수 없습니다.')
        setLoading(false)
        return
      }

      if (data.user_id !== user.id) {
        setMessage('본인이 작성한 글만 수정할 수 있습니다.')
        setLoading(false)
        return
      }

      setPost(data)
      setTitle(data.title)
      setContent(data.content)
      setLoading(false)
    }

    if (postId) {
      fetchPost()
    }
  }, [postId])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setSubmitting(true)

    if (!post) {
      setMessage('수정할 글 정보가 없습니다.')
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

    const { error } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: content.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', post.id)

    if (error) {
      console.error(error)
      setMessage('글 수정 중 오류가 발생했습니다.')
      setSubmitting(false)
      return
    }

    router.push(`/boards/${slug}/${post.id}`)
    router.refresh()
  }

  if (loading) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-slate-500">글 정보를 불러오는 중...</p>
      </section>
    )
  }

  if (message && !post) {
    return (
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-red-600 mb-4">{message}</p>
        <button
          onClick={() => router.push(`/boards/${slug}`)}
          className="px-5 py-3 rounded-xl border bg-white hover:bg-slate-100 transition"
        >
          목록으로
        </button>
      </section>
    )
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <p className="text-sm text-slate-400 mb-2">
          /boards/{slug}/{postId}/edit
        </p>
        <h1 className="text-3xl font-bold tracking-tight mb-3">글 수정</h1>
        <p className="text-slate-500">
          기존 내용을 수정하고 다시 저장할 수 있습니다.
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
              {submitting ? '저장중...' : '수정 완료'}
            </button>

            <button
              type="button"
              onClick={() => router.push(`/boards/${slug}/${postId}`)}
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