'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Flame, Zap, Clock, AlertCircle, ArrowRight, BookOpen, Library, Play } from 'lucide-react'
import { useProgressStore } from '@/lib/store/progress'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 18) return 'Good afternoon'
  return 'Good evening'
}

function getDayName() {
  return new Date().toLocaleDateString('en-US', { weekday: 'long' })
}

function getSubtext(streak: number, exercisesDone: number) {
  if (exercisesDone > 0) return "You've already trained today. Keep it up!"
  if (streak === 0) return "Start your first session to begin your streak."
  if (streak === 1) return "Your streak starts today. Don't let it end!"
  if (streak >= 7) return `${streak} days strong. You're building real habits.`
  return `${streak} day streak. Keep the momentum going.`
}

function formatMinutes(min: number) {
  if (min < 60) return `${min}m`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}h ${m}m` : `${h}h`
}

function getWeeklyMinutes(sessions: Array<{ date: number; durationMinutes: number }>) {
  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  return sessions
    .filter((s) => s.date >= oneWeekAgo)
    .reduce((sum, s) => sum + s.durationMinutes, 0)
}

export default function Dashboard() {
  const { progress, updateStreak, getTodayStats, getWeakPoints } = useProgressStore()

  useEffect(() => {
    updateStreak()
  }, [updateStreak])

  const todayStats = getTodayStats()
  const weakPoints = getWeakPoints().slice(0, 3)
  const weeklyMinutes = getWeeklyMinutes(progress.sessions)
  const recentErrors = progress.errorProfile.filter((e) => !e.resolved).slice(0, 3)

  const dailyItemCount = Math.min(3, progress.errorProfile.filter((e) => !e.resolved).length) +
    Math.min(2, progress.vocabularyLedger.filter((v) => Date.now() >= v.nextReviewDate).length) + 5 + 1

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto" style={{ fontFamily: 'var(--font-inter, sans-serif)' }}>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#F0F0F0' }}>
          {getGreeting()}, {getDayName()}.
        </h1>
        <p className="text-sm" style={{ color: '#9A9A9A' }}>
          {getSubtext(progress.streak, todayStats.exercisesDone)}
        </p>
      </div>

      {/* Top stats row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {/* Today's Training */}
        <div
          className="rounded-xl p-5"
          style={{ background: '#161616', border: '1px solid #2A2A2A' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={16} style={{ color: '#3B82F6' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>
              Today&apos;s Training
            </span>
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: '#F0F0F0' }}>
            {todayStats.exercisesDone > 0 ? (
              <span style={{ color: '#22C55E' }}>{todayStats.exercisesDone} done</span>
            ) : (
              <span>{dailyItemCount} items</span>
            )}
          </div>
          <p className="text-xs" style={{ color: '#9A9A9A' }}>
            {todayStats.exercisesDone > 0
              ? `${todayStats.accuracy}% accuracy`
              : '~8 minutes estimated'}
          </p>
        </div>

        {/* Streak */}
        <div
          className="rounded-xl p-5"
          style={{ background: '#161616', border: '1px solid #2A2A2A' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Flame size={16} style={{ color: '#F59E0B' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>
              Streak
            </span>
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: '#F0F0F0' }}>
            {progress.streak}
            <span className="text-sm font-normal ml-1" style={{ color: '#9A9A9A' }}>days</span>
          </div>
          <p className="text-xs" style={{ color: '#9A9A9A' }}>
            {progress.streakFreezeAvailable ? '❄️ Freeze available' : 'No freeze left'}
          </p>
        </div>

        {/* This Week */}
        <div
          className="rounded-xl p-5"
          style={{ background: '#161616', border: '1px solid #2A2A2A' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={16} style={{ color: '#8B5CF6' }} />
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>
              This Week
            </span>
          </div>
          <div className="text-2xl font-bold mb-1" style={{ color: '#F0F0F0' }}>
            {formatMinutes(weeklyMinutes)}
          </div>
          <p className="text-xs" style={{ color: '#9A9A9A' }}>
            {formatMinutes(progress.totalMinutes)} total
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* TODAY'S TRAINING card */}
        <div
          className="lg:col-span-2 rounded-xl p-6"
          style={{ background: '#161616', border: '1px solid #2A2A2A' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#555555' }}>
            Today&apos;s Session
          </h2>
          <p className="text-sm mb-4" style={{ color: '#9A9A9A' }}>
            Your daily session includes:
          </p>
          <ul className="space-y-2 mb-6 text-sm" style={{ color: '#9A9A9A' }}>
            {progress.errorProfile.filter((e) => !e.resolved).length > 0 && (
              <li className="flex items-center gap-2">
                <span style={{ color: '#EF4444' }}>●</span>
                {Math.min(3, progress.errorProfile.filter((e) => !e.resolved).length)} error reviews from your Mistakes Notebook
              </li>
            )}
            {progress.vocabularyLedger.filter((v) => Date.now() >= v.nextReviewDate).length > 0 && (
              <li className="flex items-center gap-2">
                <span style={{ color: '#8B5CF6' }}>●</span>
                {Math.min(2, progress.vocabularyLedger.filter((v) => Date.now() >= v.nextReviewDate).length)} vocabulary flashcards due
              </li>
            )}
            <li className="flex items-center gap-2">
              <span style={{ color: '#3B82F6' }}>●</span>
              5 mixed grammar exercises
            </li>
            <li className="flex items-center gap-2">
              <span style={{ color: '#22C55E' }}>●</span>
              1 phrasal verb exercise
            </li>
          </ul>
          <Link
            href="/practice?mode=daily"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-all"
            style={{ background: '#3B82F6', color: '#ffffff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#3B82F6' }}
          >
            <Play size={16} />
            Start Session
          </Link>
        </div>

        {/* Quick Practice */}
        <div
          className="rounded-xl p-6"
          style={{ background: '#161616', border: '1px solid #2A2A2A' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#555555' }}>
            Quick Practice
          </h2>
          <div className="space-y-3">
            <Link
              href="/practice"
              className="flex items-center gap-3 p-3 rounded-lg transition-all"
              style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A' }}
            >
              <Zap size={16} style={{ color: '#3B82F6' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: '#F0F0F0' }}>Sentence Fix</div>
                <div className="text-xs" style={{ color: '#555555' }}>Grammar exercises</div>
              </div>
            </Link>
            <Link
              href="/phrasal-verbs?tab=practice"
              className="flex items-center gap-3 p-3 rounded-lg transition-all"
              style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22C55E' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A' }}
            >
              <BookOpen size={16} style={{ color: '#22C55E' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: '#F0F0F0' }}>Phrasal Verb</div>
                <div className="text-xs" style={{ color: '#555555' }}>Quick drill</div>
              </div>
            </Link>
            <Link
              href="/vocabulary"
              className="flex items-center gap-3 p-3 rounded-lg transition-all"
              style={{ background: '#1E1E1E', border: '1px solid #2A2A2A' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8B5CF6' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A' }}
            >
              <Library size={16} style={{ color: '#8B5CF6' }} />
              <div>
                <div className="text-sm font-medium" style={{ color: '#F0F0F0' }}>Word of the Day</div>
                <div className="text-xs" style={{ color: '#555555' }}>Vocabulary review</div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Weak Points */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>
            Weak Points
          </h2>
          {weakPoints.length > 0 && (
            <Link
              href="/practice?mode=weak-points"
              className="text-xs flex items-center gap-1 transition-colors"
              style={{ color: '#3B82F6' }}
            >
              Practice all <ArrowRight size={12} />
            </Link>
          )}
        </div>
        {weakPoints.length === 0 ? (
          <div
            className="rounded-xl p-6 text-center"
            style={{ background: '#161616', border: '1px solid #2A2A2A' }}
          >
            <p className="text-sm" style={{ color: '#9A9A9A' }}>
              No weak points yet. Start practicing!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {weakPoints.map((wp) => (
              <div
                key={wp.subcategory}
                className="rounded-xl p-4"
                style={{ background: '#161616', border: '1px solid #2A2A2A' }}
              >
                <div className="flex items-center justify-between mb-2">
                  <span
                    className="text-xs px-2 py-0.5 rounded font-medium"
                    style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}
                  >
                    {wp.count} error{wp.count !== 1 ? 's' : ''}
                  </span>
                </div>
                <p className="text-sm font-medium capitalize mb-3" style={{ color: '#F0F0F0' }}>
                  {wp.subcategory.replace(/-/g, ' ')}
                </p>
                <Link
                  href={`/practice?mode=weak-points&focus=${wp.subcategory}`}
                  className="text-xs font-medium transition-colors"
                  style={{ color: '#3B82F6' }}
                >
                  Practice →
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Errors */}
      {recentErrors.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: '#555555' }}>
              Recent Errors
            </h2>
            <Link
              href="/mistakes"
              className="text-xs flex items-center gap-1"
              style={{ color: '#3B82F6' }}
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <div className="space-y-3">
            {recentErrors.map((error) => (
              <div
                key={error.exerciseId}
                className="rounded-xl p-4"
                style={{ background: '#161616', border: '1px solid #2A2A2A' }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <AlertCircle size={14} style={{ color: '#EF4444' }} />
                  <span className="text-xs font-medium capitalize" style={{ color: '#EF4444' }}>
                    {error.subcategory.replace(/-/g, ' ')}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded ml-auto"
                    style={{ background: '#1E1E1E', color: '#555555' }}
                  >
                    {error.category}
                  </span>
                </div>
                <p className="text-sm line-clamp-1" style={{ color: '#9A9A9A', fontFamily: 'var(--font-jetbrains, monospace)' }}>
                  {error.question}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
