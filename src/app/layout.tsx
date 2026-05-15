import './globals.css'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'BH Community',
  description: '커뮤니티 사이트',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-indigo-50 text-slate-900">
        <header className="sticky top-0 z-50 border-b border-slate-200/70 bg-white/80 backdrop-blur">
          <div className="max-w-6xl mx-auto h-16 px-6 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
                B
              </div>
              <span className="text-xl font-bold tracking-tight">
                BH Community
              </span>
            </Link>

            <nav className="flex items-center gap-5 text-sm font-medium text-slate-600">
              <Link href="/" className="hover:text-indigo-600 transition">
                홈
              </Link>
              <Link href="/boards" className="hover:text-indigo-600 transition">
                게시판
              </Link>
              <Link href="/boards/free" className="hover:text-indigo-600 transition">
                자유게시판
              </Link>
              <Link href="/boards/notice" className="hover:text-indigo-600 transition">
                공지사항
              </Link>
            </nav>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">{children}</main>
      </body>
    </html>
  )
}