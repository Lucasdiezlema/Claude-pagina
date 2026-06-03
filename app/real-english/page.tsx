'use client'

import { useState, useEffect } from 'react'
import { Sparkles, CheckCircle, XCircle, Eye } from 'lucide-react'
import { useProgressStore } from '@/lib/store/progress'
import { realEnglishInsights } from '@/lib/data/real-english'
import type { RealEnglishInsight } from '@/types'

const categoryColors: Record<RealEnglishInsight['category'], { background: string; color: string; label: string }> = {
  collocation: { background: 'rgba(59,130,246,0.12)', color: '#3B82F6', label: 'Collocation' },
  'false-friend': { background: 'rgba(239,68,68,0.12)', color: '#EF4444', label: 'False Friend' },
  register: { background: 'rgba(139,92,246,0.12)', color: '#8B5CF6', label: 'Register' },
  idiom: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', label: 'Idiom' },
  preposition: { background: 'rgba(34,197,94,0.12)', color: '#22C55E', label: 'Preposition' },
}

const filterCategories: Array<{ label: string; value: RealEnglishInsight['category'] | 'all' }> = [
  { label: 'All', value: 'all' },
  { label: 'Collocation', value: 'collocation' },
  { label: 'False Friend', value: 'false-friend' },
  { label: 'Register', value: 'register' },
  { label: 'Idiom', value: 'idiom' },
  { label: 'Preposition', value: 'preposition' },
]

function InsightCard({
  insight,
  isFeatured,
  onMarkSeen,
  isSeen,
}: {
  insight: RealEnglishInsight
  isFeatured?: boolean
  onMarkSeen: (id: string) => void
  isSeen: boolean
}) {
  const catStyle = categoryColors[insight.category]

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{
        background: isFeatured ? 'rgba(59,130,246,0.04)' : '#161616',
        border: isFeatured ? '1px solid rgba(59,130,246,0.2)' : '1px solid #2A2A2A',
        opacity: isSeen && !isFeatured ? 0.6 : 1,
      }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 flex-wrap">
          {isFeatured && (
            <span
              className="text-xs px-2 py-0.5 rounded font-semibold"
              style={{ background: 'rgba(59,130,246,0.15)', color: '#3B82F6' }}
            >
              Today&apos;s Insight
            </span>
          )}
          <span
            className="text-xs px-2 py-0.5 rounded font-medium"
            style={{ background: catStyle.background, color: catStyle.color }}
          >
            {catStyle.label}
          </span>
        </div>
        {isSeen && (
          <span className="flex items-center gap-1 text-xs" style={{ color: '#555555' }}>
            <Eye size={10} />
            Seen
          </span>
        )}
      </div>

      <h3 className="text-base font-bold mb-2" style={{ color: '#F0F0F0' }}>
        {insight.title}
      </h3>

      <p className="text-sm mb-4 leading-relaxed" style={{ color: '#9A9A9A' }}>
        {insight.content}
      </p>

      {/* Examples */}
      <div className="space-y-2 mb-4">
        {insight.examples.map((ex, i) => (
          <div key={i} className="flex items-start gap-2">
            {ex.correct
              ? <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
              : <XCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#EF4444' }} />}
            <div>
              <p
                className="text-sm"
                style={{
                  color: ex.correct ? '#F0F0F0' : '#EF4444',
                  fontFamily: 'var(--font-jetbrains, monospace)',
                  opacity: ex.correct ? 1 : 0.8,
                }}
              >
                {ex.text}
              </p>
              {ex.note && (
                <p className="text-xs mt-0.5" style={{ color: '#555555' }}>{ex.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {!isSeen && (
        <button
          onClick={() => onMarkSeen(insight.id)}
          className="text-xs font-medium transition-all"
          style={{ color: '#3B82F6' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#60A5FA' }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#3B82F6' }}
        >
          Mark as seen →
        </button>
      )}
    </div>
  )
}

export default function RealEnglishPage() {
  const { progress, markInsightSeen } = useProgressStore()
  const [filter, setFilter] = useState<RealEnglishInsight['category'] | 'all'>('all')

  const seenSet = new Set(progress.seenInsights)

  // Pick today's featured insight: first unseen, or random if all seen
  const unseen = realEnglishInsights.filter((i) => !seenSet.has(i.id))
  const featuredInsight = unseen[0] ?? realEnglishInsights[0]

  const filtered = realEnglishInsights.filter((i) =>
    filter === 'all' || i.category === filter
  )

  const seenCount = progress.seenInsights.length

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Sparkles size={20} style={{ color: '#F59E0B' }} />
        <h1 className="text-xl font-bold" style={{ color: '#F0F0F0' }}>Real English</h1>
      </div>
      <p className="text-sm mb-8" style={{ color: '#9A9A9A' }}>
        {realEnglishInsights.length} insights · {seenCount} seen
      </p>

      {/* Today's featured insight */}
      <div className="mb-8">
        <InsightCard
          insight={featuredInsight}
          isFeatured
          onMarkSeen={markInsightSeen}
          isSeen={seenSet.has(featuredInsight.id)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-6">
        {filterCategories.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
            style={{
              background: filter === f.value
                ? f.value === 'all' ? 'rgba(245,158,11,0.12)' : categoryColors[f.value as RealEnglishInsight['category']]?.background ?? '#1E1E1E'
                : '#161616',
              color: filter === f.value
                ? f.value === 'all' ? '#F59E0B' : categoryColors[f.value as RealEnglishInsight['category']]?.color ?? '#9A9A9A'
                : '#9A9A9A',
              border: `1px solid ${filter === f.value
                ? f.value === 'all' ? '#F59E0B' : categoryColors[f.value as RealEnglishInsight['category']]?.color ?? '#2A2A2A'
                : '#2A2A2A'}`,
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* All insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered
          .filter((i) => i.id !== featuredInsight.id)
          .map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              onMarkSeen={markInsightSeen}
              isSeen={seenSet.has(insight.id)}
            />
          ))}
      </div>
    </div>
  )
}
