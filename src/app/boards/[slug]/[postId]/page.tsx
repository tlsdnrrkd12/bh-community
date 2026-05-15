'use client'

import { FormEvent, useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase/client'

type ProfileType =
  | {
      nickname: string
    }
  | {
      nickname: string
    }[]
  | null

type Post = {
  id: number
  title: string
  content: string
  created_at: string
  user_id: string
  profiles: ProfileType
}

type Comment = {
  id: number
  content: string
  created_at: string
  user_id: string
  profiles: ProfileType
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()

  const postId = params.postId as string
  const slug = params.slug as string

  const [post, setPost] = useState<Post | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [commentText, setCommentText] = useState('')
  const [loading, setLoading] = useState(true)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [message, setMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  const getNickname = (profiles: ProfileType) => {
    if (!profiles) return '알 수 없음'

    if (Array.isArray(profiles)) {
      return profiles[0]?.nickname ?? '알 수 없음'
    }

    return profiles.nickname
  }

  const fetchData = async () => {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    setCurrentUserId(user?.id ?? null)

    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select(`
        id,
        title,
        content,
        created_at,
        user_id,
        profiles (
          nickname
        )
      `)
      .eq('id', postId)
      .eq('status', 'active')
      .single()

    if (postError || !postData) {
      setPost(null)
      setComments([])
      setLoading(false)
      return
    }

    setPost(postData)

    const { data: commentData, error: commentError } = await supabase
      .from('comments')
      .select(`
        id,
        content,
        created_at,
        user_id,
        profiles (
          nickname
        )
      `)
      .eq('post_id', postId)
      .eq('status', 'active')
      .order('created_at', { ascending: true })

    if (commentError) {
      console.error(commentError)
      setComments([])
    } else {
      setComments(commentData ?? [])
    }

    setLoading(false)
  }

  useEffect(() => {
    if (postId) {
      fetchData()
    }
  }, [postId])

  const handleCommentSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setMessage('')
    setCommentSubmitting(true)

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      setMessage('로그인 후 댓글을 작성할 수 있습니다.')
      setCommentSubmitting(false)
      return
    }

    if (!commentText.trim()) {
      setMessage('댓글 내용을 입력해주세요.')
      setCommentSubmitting(false)
      return
    }

    const { error } = await supabase.from('comments').insert({
      post_id: Number(postId),
      user_id: user.id,
      content: commentText.trim(),
      status: 'active',
    })

    if (error) {
      console.error(error)
      setMessage('댓글 저장 중 오류가 발생했습니다.')
      setCommentSubmitting(false)
      return
    }

    setCommentText('')
    await fetchData()
    setCommentSubmitting(false)
  }

  const handleDeletePost = async () => {
    if (!post) return

    const ok = window.confirm('정말 이 글을 삭제하시겠습니까?')
    if (!ok) return

    const { error } = await supabase
      .from('posts')
      .update({ status: 'deleted' })
      .eq('id', post.id)

    if (error) {
      console.error(error)
      alert('글 삭제 중 오류가 발생했습니다.')
      return
    }

    router.push(`/boards/${slug}`)
    router.refresh()
  }

  const handleDeleteComment = async (commentId: number) => {
    const ok = window.confirm('정말 이 댓글을 삭제하시겠습니까?')
    if (!ok) return

    const { error } = await supabase
      .from('comments')
      .update({ status: 'deleted' })
      .eq('id', commentId)
      .eq('user_id', currentUserId)

    if (error) {
      console.error('댓글 삭제 오류:', error)
      alert(`댓글 삭제 중 오류가 발생했습니다: ${error.message}`)
      return
    }

    await fetchData()
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border shadow-sm p-8">
          <p className="text-slate-500">게시글을 불러오는 중...</p>
        </section>
      </div>
    )
  }

  if (!post) {
    return (
      <div className="space-y-6">
        <section className="bg-white rounded-2xl border shadow-sm p-8">
          <h1 className="text-2xl font-bold mb-2">
            글을 찾을 수 없습니다.
          </h1>

          <p className="text-slate-500">
            삭제되었거나 존재하지 않는 게시글입니다.
          </p>
        </section>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.push(`/boards/${slug}`)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border bg-white hover:bg-slate-100 transition"
          >
            ← 목록으로
          </button>

          {currentUserId === post.user_id && (
            <div className="flex gap-2">
              <Link
                href={`/boards/${slug}/${post.id}/edit`}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-100 transition"
              >
                수정
              </Link>

              <button
                onClick={handleDeletePost}
                className="px-4 py-2 rounded-xl border bg-white hover:bg-slate-100 transition"
              >
                삭제
              </button>
            </div>
          )}
        </div>

        <p className="text-sm text-slate-400 mb-2">
          /boards/{slug}/{post.id}
        </p>

        <h1 className="text-4xl font-bold tracking-tight mb-4">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 mb-8">
          <span>작성자: {getNickname(post.profiles)}</span>
          <span>·</span>
          <span>{new Date(post.created_at).toLocaleString()}</span>
        </div>

        <div className="rounded-2xl border bg-slate-50 p-6 whitespace-pre-wrap leading-7 text-slate-800">
          {post.content}
        </div>
      </section>

      <section className="bg-white rounded-2xl border shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6">댓글</h2>

        <div className="space-y-4 mb-8">
          {comments.length === 0 ? (
            <div className="rounded-2xl border bg-slate-50 p-6">
              <p className="text-slate-500">
                아직 댓글이 없습니다.
              </p>
            </div>
          ) : (
            comments.map((comment) => (
              <div
                key={comment.id}
                className="rounded-2xl border bg-slate-50 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
                      <span className="font-semibold text-slate-900">
                        {getNickname(comment.profiles)}
                      </span>

                      <span className="text-slate-400">·</span>

                      <span className="text-slate-500">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>

                    <p className="whitespace-pre-wrap text-slate-800">
                      {comment.content}
                    </p>
                  </div>

                  {currentUserId === comment.user_id && (
                    <button
                      onClick={() =>
                        handleDeleteComment(comment.id)
                      }
                      className="shrink-0 px-3 py-1.5 rounded-lg border bg-white hover:bg-slate-100 text-sm transition"
                    >
                      삭제
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        <form
          onSubmit={handleCommentSubmit}
          className="space-y-4"
        >
          <textarea
            value={commentText}
            onChange={(e) =>
              setCommentText(e.target.value)
            }
            placeholder="댓글을 입력하세요"
            className="w-full min-h-[120px] rounded-2xl border bg-slate-50 px-4 py-3 outline-none focus:ring-2 focus:ring-slate-300"
          />

          <div className="flex items-center justify-between gap-4">
            {message ? (
              <p className="text-sm text-red-600">
                {message}
              </p>
            ) : (
              <div />
            )}

            <button
              type="submit"
              disabled={commentSubmitting}
              className="px-5 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-700 transition disabled:opacity-60"
            >
              {commentSubmitting
                ? '등록중...'
                : '댓글 등록'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}