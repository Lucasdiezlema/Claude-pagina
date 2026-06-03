'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AlertCircle, CheckCircle, ArrowRight } from 'lucide-react'
import { useProgressStore } from '@/lib/store/progress'
import type { ErrorCategory, ErrorEntry } from '@/types'

const filterCategories: Array<{ label: string; value: ErrorCategory | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Grammar', value: 'grammar' },
  { label: 'Vocabulary', value: 'vocabulary' },
  { label: 'Naturalness', value: 'naturalness' },
  { label: 'Phrasal Verbs', value: 'phrasal-verb' },
]

const sortOptions = [
  { label: 'By Date', value: 'date' },
  { label: 'By Frequency', value: 'frequency' },
  { label: 'By Due Date', value: 'due' },
]

function timeAgo(timestamp: number) {
  const diff = Date.now() - timestamp
  const days = Math.floor(diff / (24 * 60 * 60 * 1000))
  const hours = Math.floor(diff / (60 * 60 * 1000))
  if (days > 1) return `${days} days ago`
  if (days === 1) return '1 day ago'
  if (hours > 1) return `${hours} hours ago`
  return 'Just now'
}

function isDueSoon(nextReviewDate: number) {
  return Date.now() >= nextReviewDate
}

const categoryColors: Record<string, { background: string; color: string }> = {
  grammar: { background: 'rgba(59,130,246,0.12)', color: '#3B82F6' },
  vocabulary: { background: 'rgba(139,92,246,0.12)', color: '#8B5CF6' },
  naturalness: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
  'phrasal-verb': { background: 'rgba(34,197,94,0.12)', color: '#22C55E' },
}

function ErrorCard({ entry, onDismiss }: { entry: ErrorEntry; onDismiss: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)
  const catStyle = categoryColors[entry.category] ?? { bg: '#1E1E1E', text: '#9A9A9A' }
  const due = isDueSoon(entry.nextReviewDate)

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{
        background: '#161616',
        border: `1px solid ${due ? '#2A2A2A' : '#1E1E1E'}`,
        opacity: entry.resolved ? 0.5 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2 flex-wrap">
          <AlertCircle size={14} style={{ color: '#EF4444', flexShrink: 0 }} />
          <span className="text-sm font-semibold capitalize" style={{ color: '#F0F0F0' }}>
            {entry.subcategory.replace(/-/g, ' ')}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded font-medium"
            style={catStyle}
          >
            {entry.category}
          </span>
          {due && !entry.resolved && (
            <span
              className="text-xs px-2 py-0.5 rounded font-medium"
              style={{ background: 'rgba(239,68,68,0.12)', color: '#EF4444' }}
            >
              Due for review
            </span>
          )}
        </div>
        <span className="text-xs whitespace-nowrap" style={{ color: '#555555' }}>
          {timeAgo(entry.timestamp)}
        </span>
      </div>

      <div className="h-px my-3" style={{ background: '#2A2A2A' }} />

      <p className="text-xs mb-1" style={{ color: '#555555' }}>You answered:</p>
      <p
        className="text-sm mb-2 px-2 py-1 rounded"
        style={{
          color: '#EF4444',
          background: 'rgba(239,68,68,0.08)',
          fontFamily: 'var(--font-jetbrains, monospace)',
        }}
      >
        ✗ {entry.userAnswer || '(no answer recorded)'}
      </p>

      <p className="text-xs mb-1" style={{ color: '#555555' }}>Correct answer:</p>
      <p
        className="text-sm mb-2 px-2 py-1 rounded"
        style={{
          color: '#22C55E',
          background: 'rgba(34,197,94,0.08)',
          fontFamily: 'var(--font-jetbrains, monospace)',
        }}
      >
        ✓ {entry.correctAnswer}
      </p>

      {expanded && (
        <div className="mt-3">
          <p className="text-sm mb-2" style={{ color: '#9A9A9A' }}>{entry.explanation}</p>
          {entry.nativeTip && (
            <p
              className="text-xs p-2 rounded"
              style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6' }}
            >
              💡 {entry.nativeTip}
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-3 mt-3">
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-xs"
          style={{ color: '#3B82F6' }}
        >
          {expanded ? 'Hide explanation' : 'Show explanation'}
        </button>

        <div className="flex gap-2 ml-auto">
          <Link
            href={`/practice?mode=weak-points&focus=${entry.subcategory}`}
            className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all"
            style={{ background: 'rgba(59,130,246,0.12)', color: '#3B82F6' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.2)' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(59,130,246,0.12)' }}
          >
            Review <ArrowRight size={10} />
          </Link>
          {!entry.resolved && (
            <button
              onClick={() => onDismiss(entry.exerciseId)}
              className="flex items-center gap-1 px-3 py-1.5 rounded text-xs font-medium transition-all"
              style={{ background: '#1E1E1E', color: '#555555', border: '1px solid #2A2A2A' }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#22C55E'; e.currentTarget.style.color = '#22C55E' }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#555555' }}
            >
              <CheckCircle size={10} />
              Dismiss
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function MistakesPage() {
  const { progress, resolveError } = useProgressStore()
  const [filter, setFilter] = useState<ErrorCategory | 'all'>('all')
  const [sort, setSort] = useState('date')
  const [showResolved, setShowResolved] = useState(false)

  const filtered = progress.errorProfile
    .filter((e) => {
      if (!showResolved && e.resolved) return false
      if (filter !== 'all' && e.category !== filter) return false
      return true
    })
    .sort((a, b) => {
      if (sort === 'date') return b.timestamp - a.timestamp
      if (sort === 'due') return a.nextReviewDate - b.nextReviewDate
      return 0
    })

  const unresolvedCount = progress.errorProfile.filter((e) => !e.resolved).length
  const dueCount = progress.errorProfile.filter((e) => !e.resolved && Date.now() >= e.nextReviewDate).length

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#F0F0F0' }}>Mistakes Notebook</h1>
          <p className="text-sm" style={{ color: '#9A9A9A' }}>
            {unresolvedCount} unresolved error{unresolvedCount !== 1 ? 's' : ''}
            {dueCount > 0 && (
              <span style={{ color: '#EF4444' }}> · {dueCount} due for review</span>
            )}
          </p>
        </div>
        {unresolvedCount > 0 && (
          <Link
            href="/practice?mode=weak-points"
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all"
            style={{ background: '#EF4444', color: '#fff' }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#DC2626' }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#EF4444' }}
          >
            Practice All Weak Points
            <ArrowRight size={14} />
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {filterCategories.map((f) => (
            <button
              key={f.value}
              onClick={() => setFilter(f.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: filter === f.value ? 'rgba(239,68,68,0.12)' : '#161616',
                color: filter === f.value ? '#EF4444' : '#9A9A9A',
                border: `1px solid ${filter === f.value ? '#EF4444' : '#2A2A2A'}`,
              }}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 md:ml-auto">
          {sortOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => setSort(s.value)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background: sort === s.value ? 'rgba(59,130,246,0.12)' : '#1E1E1E',
                color: sort === s.value ? '#3B82F6' : '#555555',
                border: `1px solid ${sort === s.value ? '#3B82F6' : '#2A2A2A'}`,
              }}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Toggle resolved */}
      <div className="mb-4">
        <label className="flex items-center gap-2 text-xs cursor-pointer" style={{ color: '#555555' }}>
          <input
            type="checkbox"
            checked={showResolved}
            onChange={(e) => setShowResolved(e.target.checked)}
            className="rounded"
          />
          Show resolved errors
        </label>
      </div>

      {/* Error list */}
      {filtered.length === 0 ? (
        <div
          className="rounded-xl p-12 text-center"
          style={{ background: '#161616', border: '1px solid #2A2A2A' }}
        >
          <AlertCircle size={32} className="mx-auto mb-4" style={{ color: '#2A2A2A' }} />
          <p className="text-sm" style={{ color: '#9A9A9A' }}>
            {progress.errorProfile.length === 0
              ? "No mistakes yet — start practicing to track your errors!"
              : "No errors match your current filters."}
          </p>
          {progress.errorProfile.length === 0 && (
            <Link
              href="/practice?mode=daily"
              className="mt-4 inline-flex items-center gap-2 text-sm"
              style={{ color: '#3B82F6' }}
            >
              Start practicing <ArrowRight size={14} />
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((entry) => (
            <ErrorCard
              key={entry.exerciseId}
              entry={entry}
              onDismiss={resolveError}
            />
          ))}
        </div>
      )}
    </div>
  )
}
