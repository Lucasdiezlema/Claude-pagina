'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Zap,
  BookOpen,
  AlertCircle,
  Library,
  GraduationCap,
  Sparkles,
  Menu,
  X,
  Flame,
} from 'lucide-react'
import { useState } from 'react'
import { useProgressStore } from '@/lib/store/progress'

const navItems = [
  { label: 'Dashboard', icon: LayoutDashboard, href: '/' },
  { label: 'Practice', icon: Zap, href: '/practice', primary: true },
  { label: 'Phrasal Verbs', icon: BookOpen, href: '/phrasal-verbs' },
  { label: 'Mistakes', icon: AlertCircle, href: '/mistakes', badge: 'errors' },
  { label: 'Vocabulary', icon: Library, href: '/vocabulary', badge: 'vocab' },
  { label: 'Theory', icon: GraduationCap, href: '/theory' },
  { label: 'Real English', icon: Sparkles, href: '/real-english' },
]

export function Sidebar() {
  const pathname = usePathname()
  const [mobileOpen, setMobileOpen] = useState(false)
  const { progress } = useProgressStore()

  const errorCount = progress.errorProfile.filter((e) => !e.resolved).length
  const dueVocabCount = progress.vocabularyLedger.filter(
    (v) => Date.now() >= v.nextReviewDate
  ).length

  function getBadgeCount(badge?: string) {
    if (badge === 'errors') return errorCount
    if (badge === 'vocab') return dueVocabCount
    return 0
  }

  const sidebarContent = (
    <div
      style={{ background: '#161616', borderRight: '1px solid #2A2A2A' }}
      className="flex flex-col h-full w-60"
    >
      {/* Logo */}
      <div className="px-6 py-5 flex items-center justify-between" style={{ borderBottom: '1px solid #2A2A2A' }}>
        <span className="text-xl font-bold" style={{ color: '#F0F0F0', letterSpacing: '0.25em' }}>
          ENGL<span style={{ color: '#3B82F6' }}>SH</span>
        </span>
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(false)}
          style={{ color: '#9A9A9A' }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href)
          const badgeCount = getBadgeCount(item.badge)
          const isErrorBadge = item.badge === 'errors'

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-150"
              style={{
                background: isActive ? 'rgba(59, 130, 246, 0.12)' : 'transparent',
                color: isActive ? '#F0F0F0' : '#9A9A9A',
                borderLeft: isActive ? '2px solid #3B82F6' : '2px solid transparent',
                textDecoration: 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = '#1E1E1E'
                  e.currentTarget.style.color = '#F0F0F0'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.color = '#9A9A9A'
                }
              }}
            >
              <Icon
                size={18}
                style={{ color: isActive ? '#3B82F6' : 'inherit', flexShrink: 0 }}
              />
              <span className="text-sm font-medium flex-1">{item.label}</span>
              {item.primary && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded font-semibold"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}
                >
                  Go
                </span>
              )}
              {badgeCount > 0 && (
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full font-bold min-w-5 text-center"
                  style={{
                    background: isErrorBadge ? 'rgba(239,68,68,0.15)' : 'rgba(59,130,246,0.15)',
                    color: isErrorBadge ? '#EF4444' : '#3B82F6',
                  }}
                >
                  {badgeCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: streak + level */}
      <div className="px-4 py-4" style={{ borderTop: '1px solid #2A2A2A' }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame size={16} style={{ color: '#F59E0B' }} />
            <span className="text-sm font-semibold" style={{ color: '#F0F0F0' }}>
              {progress.streak}
            </span>
            <span className="text-xs" style={{ color: '#555555' }}>day streak</span>
          </div>
          <span
            className="text-xs px-2 py-1 rounded font-bold"
            style={{ background: 'rgba(139,92,246,0.15)', color: '#8B5CF6' }}
          >
            {progress.level}
          </span>
        </div>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full" style={{ background: '#2A2A2A' }}>
            <div
              className="h-1 rounded-full"
              style={{
                background: '#3B82F6',
                width: `${Math.min(100, (progress.xpToday / 200) * 100)}%`,
                transition: 'width 0.3s ease',
              }}
            />
          </div>
          <span className="text-xs" style={{ color: '#555555' }}>
            {progress.xpToday} XP
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg"
        style={{ background: '#1E1E1E', color: '#F0F0F0' }}
        onClick={() => setMobileOpen(true)}
      >
        <Menu size={20} />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden md:flex fixed left-0 top-0 h-full z-40">
        {sidebarContent}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0"
            style={{ background: 'rgba(0,0,0,0.7)' }}
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative z-10 flex">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
