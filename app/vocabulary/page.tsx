'use client'

import { useState } from 'react'
import { Library, ChevronDown, ChevronUp } from 'lucide-react'
import { useProgressStore } from '@/lib/store/progress'
import type { VocabEntry } from '@/types'

const statusColors: Record<VocabEntry['status'], { bg: string; text: string; label: string }> = {
  new: { bg: 'rgba(85,85,85,0.15)', text: '#555555', label: 'New' },
  weak: { bg: 'rgba(239,68,68,0.12)', text: '#EF4444', label: 'Weak' },
  strong: { bg: 'rgba(59,130,246,0.12)', text: '#3B82F6', label: 'Strong' },
  mastered: { bg: 'rgba(34,197,94,0.12)', text: '#22C55E', label: 'Mastered' },
}

const levelColors: Record<string, string> = {
  B1: '#22C55E',
  B2: '#3B82F6',
  C1: '#8B5CF6',
}

function ReviewCard({ vocab, onReview }: { vocab: VocabEntry; onReview: (id: string, quality: number) => void }) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className="max-w-lg mx-auto">
      <div
        className="rounded-xl p-6 mb-4 transition-all"
        style={{ background: '#161616', border: '1px solid #2A2A2A', minHeight: 220 }}
      >
        <div className="flex items-center justify-between mb-4">
          <span
            className="text-xs px-2 py-0.5 rounded font-semibold"
            style={{ background: `${levelColors[vocab.level]}22`, color: levelColors[vocab.level] }}
          >
            {vocab.level}
          </span>
          <span className="text-xs" style={{ color: '#555555' }}>{vocab.tag}</span>
        </div>

        <div className="text-center py-4">
          <p className="text-3xl font-bold mb-2" style={{ color: '#F0F0F0' }}>{vocab.word}</p>
          <p className="text-sm" style={{ color: '#555555' }}>{vocab.phonetic}</p>
        </div>

        {!revealed ? (
          <button
            onClick={() => setRevealed(true)}
            className="w-full mt-4 py-2.5 rounded-lg text-sm font-medium transition-all"
            style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', color: '#9A9A9A' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.color = '#F0F0F0' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#9A9A9A' }}
          >
            Reveal Translation & Definition
          </button>
        ) : (
          <div className="mt-4 animate-fade-in">
            <div className="h-px mb-4" style={{ background: '#2A2A2A' }} />
            <p className="text-lg font-semibold mb-1" style={{ color: '#F59E0B' }}>{vocab.translation}</p>
            <p className="text-sm mb-3" style={{ color: '#9A9A9A' }}>{vocab.definition}</p>

            {vocab.commonMistake && (
              <p className="text-xs p-2 rounded mb-3" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
                ⚠️ {vocab.commonMistake}
              </p>
            )}

            <div className="space-y-1">
              {vocab.examples.slice(0, 2).map((ex, i) => (
                <p
                  key={i}
                  className="text-sm italic"
                  style={{
                    color: '#9A9A9A',
                    fontFamily: 'var(--font-jetbrains, monospace)',
                    borderLeft: '2px solid #2A2A2A',
                    paddingLeft: '0.75rem',
                  }}
                >
                  &ldquo;{ex}&rdquo;
                </p>
              ))}
            </div>
          </div>
        )}
      </div>

      {revealed && (
        <div className="animate-fade-in">
          <p className="text-xs text-center mb-3" style={{ color: '#555555' }}>How well did you know this?</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: 'Again', quality: 0, style: { background: 'rgba(239,68,68,0.12)', color: '#EF4444', border: '1px solid #EF444433' } },
              { label: 'Hard', quality: 2, style: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B', border: '1px solid #F59E0B33' } },
              { label: 'Good', quality: 4, style: { background: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: '1px solid #3B82F633' } },
              { label: 'Easy', quality: 5, style: { background: 'rgba(34,197,94,0.12)', color: '#22C55E', border: '1px solid #22C55E33' } },
            ].map(({ label, quality, style }) => (
              <button
                key={label}
                onClick={() => {
                  onReview(vocab.id, quality)
                  setRevealed(false)
                }}
                className="py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={style}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-center mt-2" style={{ color: '#555555' }}>
            Again = tomorrow · Hard = 1-2 days · Good = few days · Easy = 1+ week
          </p>
        </div>
      )}
    </div>
  )
}

export default function VocabularyPage() {
  const { progress, reviewVocab } = useProgressStore()
  const [view, setView] = useState<'review' | 'list'>('review')
  const [filterStatus, setFilterStatus] = useState<VocabEntry['status'] | 'all'>('all')
  const [filterLevel, setFilterLevel] = useState<'all' | 'B1' | 'B2' | 'C1'>('all')
  const [filterTag, setFilterTag] = useState('all')
  const [reviewIndex, setReviewIndex] = useState(0)

  const allTags = [...new Set(progress.vocabularyLedger.map((v) => v.tag))]

  const dueVocab = progress.vocabularyLedger.filter((v) => Date.now() >= v.nextReviewDate)

  const filteredList = progress.vocabularyLedger.filter((v) => {
    if (filterStatus !== 'all' && v.status !== filterStatus) return false
    if (filterLevel !== 'all' && v.level !== filterLevel) return false
    if (filterTag !== 'all' && v.tag !== filterTag) return false
    return true
  })

  const totalWords = progress.vocabularyLedger.length
  const masteredCount = progress.vocabularyLedger.filter((v) => v.status === 'mastered').length
  const strongCount = progress.vocabularyLedger.filter((v) => v.status === 'strong').length
  const weakCount = progress.vocabularyLedger.filter((v) => v.status === 'weak').length
  const newCount = progress.vocabularyLedger.filter((v) => v.status === 'new').length
  const dueCount = dueVocab.length

  const currentReviewVocab = dueVocab[reviewIndex]

  function handleReview(id: string, quality: number) {
    reviewVocab(id, quality)
    if (reviewIndex < dueVocab.length - 1) {
      setReviewIndex((i) => i + 1)
    } else {
      setReviewIndex(0)
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Library size={20} style={{ color: '#8B5CF6' }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F0F0F0' }}>Vocabulary</h1>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
        {[
          { label: 'Total', count: totalWords, color: '#F0F0F0' },
          { label: 'Mastered', count: masteredCount, color: '#22C55E' },
          { label: 'Strong', count: strongCount, color: '#3B82F6' },
          { label: 'Weak', count: weakCount, color: '#EF4444' },
          { label: 'Due Today', count: dueCount, color: '#F59E0B' },
        ].map(({ label, count, color }) => (
          <div
            key={label}
            className="rounded-xl p-4 text-center"
            style={{ background: '#161616', border: '1px solid #2A2A2A' }}
          >
            <div className="text-xl font-bold mb-1" style={{ color }}>{count}</div>
            <div className="text-xs" style={{ color: '#555555' }}>{label}</div>
          </div>
        ))}
      </div>

      {/* View toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => setView('review')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: view === 'review' ? 'rgba(139,92,246,0.12)' : '#1E1E1E',
            color: view === 'review' ? '#8B5CF6' : '#555555',
            border: `1px solid ${view === 'review' ? '#8B5CF6' : '#2A2A2A'}`,
          }}
        >
          Review Cards ({dueCount} due)
        </button>
        <button
          onClick={() => setView('list')}
          className="px-4 py-2 rounded-lg text-sm font-medium transition-all"
          style={{
            background: view === 'list' ? 'rgba(139,92,246,0.12)' : '#1E1E1E',
            color: view === 'list' ? '#8B5CF6' : '#555555',
            border: `1px solid ${view === 'list' ? '#8B5CF6' : '#2A2A2A'}`,
          }}
        >
          All Words
        </button>
      </div>

      {/* Review mode */}
      {view === 'review' && (
        <div>
          {dueVocab.length === 0 ? (
            <div
              className="rounded-xl p-12 text-center"
              style={{ background: '#161616', border: '1px solid #2A2A2A' }}
            >
              <Library size={32} className="mx-auto mb-4" style={{ color: '#2A2A2A' }} />
              <p className="text-sm mb-2" style={{ color: '#F0F0F0' }}>All caught up!</p>
              <p className="text-sm" style={{ color: '#9A9A9A' }}>
                No vocabulary due for review right now. Check back later.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm" style={{ color: '#9A9A9A' }}>
                  Card {reviewIndex + 1} of {dueVocab.length}
                </p>
                <div className="h-1 flex-1 mx-4 rounded-full" style={{ background: '#2A2A2A' }}>
                  <div
                    className="h-1 rounded-full"
                    style={{
                      background: '#8B5CF6',
                      width: `${((reviewIndex) / dueVocab.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
              {currentReviewVocab && (
                <ReviewCard vocab={currentReviewVocab} onReview={handleReview} />
              )}
            </div>
          )}
        </div>
      )}

      {/* List mode */}
      {view === 'list' && (
        <div>
          {/* Filters */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(['all', 'new', 'weak', 'strong', 'mastered'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="px-3 py-1 rounded text-xs font-medium capitalize"
                style={{
                  background: filterStatus === s ? (s === 'all' ? 'rgba(139,92,246,0.12)' : statusColors[s as VocabEntry['status']]?.bg ?? '#1E1E1E') : '#1E1E1E',
                  color: filterStatus === s ? (s === 'all' ? '#8B5CF6' : statusColors[s as VocabEntry['status']]?.text ?? '#555555') : '#555555',
                  border: '1px solid #2A2A2A',
                }}
              >
                {s === 'all' ? 'All' : (statusColors[s as VocabEntry['status']]?.label ?? s)}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2 mb-4">
            {['all', 'B1', 'B2', 'C1'].map((l) => (
              <button
                key={l}
                onClick={() => setFilterLevel(l as 'all' | 'B1' | 'B2' | 'C1')}
                className="px-3 py-1 rounded text-xs font-semibold"
                style={{
                  background: filterLevel === l ? 'rgba(59,130,246,0.12)' : '#1E1E1E',
                  color: filterLevel === l ? '#3B82F6' : '#555555',
                  border: '1px solid #2A2A2A',
                }}
              >
                {l}
              </button>
            ))}
          </div>

          {/* List */}
          <div className="space-y-2">
            {filteredList.map((v) => (
              <VocabListItem key={v.id} vocab={v} />
            ))}
          </div>

          {filteredList.length === 0 && (
            <p className="text-center py-8 text-sm" style={{ color: '#555555' }}>
              No words match your filters.
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function VocabListItem({ vocab }: { vocab: VocabEntry }) {
  const [expanded, setExpanded] = useState(false)
  const statStyle = statusColors[vocab.status]

  return (
    <div
      className="rounded-xl transition-all"
      style={{ background: '#161616', border: '1px solid #2A2A2A' }}
    >
      <button
        className="w-full flex items-center gap-3 p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div
          className="w-2 h-2 rounded-full flex-shrink-0"
          style={{ background: statStyle.text }}
        />
        <span className="font-medium text-sm flex-1" style={{ color: '#F0F0F0' }}>{vocab.word}</span>
        <span className="text-sm" style={{ color: '#9A9A9A' }}>{vocab.translation}</span>
        <span
          className="text-xs px-1.5 py-0.5 rounded"
          style={{ background: statStyle.bg, color: statStyle.text }}
        >
          {statStyle.label}
        </span>
        <span className="text-xs ml-1" style={{ color: '#555555' }}>{vocab.level}</span>
        {expanded ? <ChevronUp size={14} style={{ color: '#555555' }} /> : <ChevronDown size={14} style={{ color: '#555555' }} />}
      </button>

      {expanded && (
        <div className="px-4 pb-4 animate-fade-in">
          <div className="h-px mb-3" style={{ background: '#2A2A2A' }} />
          <p className="text-xs mb-1" style={{ color: '#555555' }}>{vocab.phonetic}</p>
          <p className="text-sm mb-2" style={{ color: '#9A9A9A' }}>{vocab.definition}</p>
          {vocab.commonMistake && (
            <p className="text-xs p-2 rounded mb-2" style={{ background: 'rgba(239,68,68,0.08)', color: '#EF4444' }}>
              ⚠️ {vocab.commonMistake}
            </p>
          )}
          <div className="space-y-1">
            {vocab.examples.slice(0, 2).map((ex, i) => (
              <p
                key={i}
                className="text-sm italic pl-3"
                style={{
                  color: '#9A9A9A',
                  borderLeft: '2px solid #2A2A2A',
                  fontFamily: 'var(--font-jetbrains, monospace)',
                }}
              >
                &ldquo;{ex}&rdquo;
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
