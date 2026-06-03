import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { Sidebar } from '@/components/Sidebar'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'ENGLSH — English Learning Platform',
  description: 'Personal English learning app with spaced repetition, phrasal verbs, grammar practice, and vocabulary training.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable}`}
      style={{ background: '#0F0F0F', colorScheme: 'dark' }}
    >
      <body
        style={{
          background: '#0F0F0F',
          color: '#F0F0F0',
          fontFamily: 'var(--font-inter), Inter, sans-serif',
          minHeight: '100vh',
        }}
      >
        <Sidebar />
        <main
          className="md:ml-60 min-h-screen"
          style={{ background: '#0F0F0F' }}
        >
          {children}
        </main>
      </body>
    </html>
  )
}
