'use client'

import { useState } from 'react'
import Link from 'next/link'
import { GraduationCap, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { theoryCards } from '@/lib/data/theory'

const levelColors: Record<string, string> = {
  B1: '#22C55E',
  B2: '#3B82F6',
  C1: '#8B5CF6',
}

export default function TheoryPage() {
  const [filter, setFilter] = useState<'all' | 'B1' | 'B2' | 'C1'>('all')
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = theoryCards.filter((tc) =>
    filter === 'all' || tc.level === filter
  )

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <GraduationCap size={20} style={{ color: '#8B5CF6' }} />
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#F0F0F0' }}>Theory Cards</h1>
          <p className="text-sm" style={{ color: '#9A9A9A' }}>{theoryCards.length} grammar topics</p>
        </div>
      </div>

      {/* Level filters */}
      <div className="flex gap-2 mb-8">
        {['all', 'B1', 'B2', 'C1'].map((l) => (
          <button
            key={l}
            onClick={() => setFilter(l as 'all' | 'B1' | 'B2' | 'C1')}
            className="px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            style={{
              background: filter === l
                ? l === 'all' ? 'rgba(139,92,246,0.12)' : `${levelColors[l]}22`
                : '#1E1E1E',
              color: filter === l
                ? l === 'all' ? '#8B5CF6' : levelColors[l]
                : '#555555',
              border: `1px solid ${filter === l ? (l === 'all' ? '#8B5CF6' : levelColors[l]) : '#2A2A2A'}`,
            }}
          >
            {l === 'all' ? 'All Levels' : l}
          </button>
        ))}
      </div>

      {/* Cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((card) => {
          const isExpanded = expanded === card.id

          return (
            <div
              key={card.id}
              className="rounded-xl overflow-hidden transition-all"
              style={{ background: '#161616', border: '1px solid #2A2A2A' }}
            >
              {/* Card header */}
              <div
                className="p-5 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : card.id)}
              >
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="text-base font-bold leading-tight" style={{ color: '#F0F0F0' }}>
                    {card.title}
                  </h3>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded font-semibold flex-shrink-0"
                    style={{ background: `${levelColors[card.level]}22`, color: levelColors[card.level] }}
                  >
                    {card.level}
                  </span>
                </div>
                <p className="text-sm" style={{ color: '#9A9A9A' }}>{card.subtitle}</p>

                {/* Tags */}
                <div className="flex flex-wrap gap-1 mt-3">
                  {card.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{ background: '#1E1E1E', color: '#555555' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-5 pb-5 animate-fade-in">
                  <div className="h-px mb-4" style={{ background: '#2A2A2A' }} />

                  {/* Rule */}
                  <div
                    className="rounded-lg p-4 mb-4"
                    style={{ background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.15)' }}
                  >
                    <p className="text-sm leading-relaxed" style={{ color: '#9A9A9A' }}>{card.rule}</p>
                  </div>

                  {/* Examples */}
                  <div className="mb-4 space-y-2">
                    {card.examples.map((ex, i) => (
                      <div key={i}>
                        <div className="flex items-start gap-2">
                          <CheckCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#22C55E' }} />
                          <p
                            className="text-sm"
                            style={{ color: '#F0F0F0', fontFamily: 'var(--font-jetbrains, monospace)' }}
                          >
                            {ex.correct}
                          </p>
                        </div>
                        {ex.incorrect && (
                          <div className="flex items-start gap-2 mt-1">
                            <XCircle size={14} className="mt-0.5 flex-shrink-0" style={{ color: '#EF4444' }} />
                            <p
                              className="text-sm"
                              style={{ color: '#EF4444', fontFamily: 'var(--font-jetbrains, monospace)', opacity: 0.8 }}
                            >
                              {ex.incorrect}
                            </p>
                          </div>
                        )}
                        {ex.note && (
                          <p className="text-xs ml-5 mt-0.5" style={{ color: '#555555' }}>{ex.note}</p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Trap */}
                  {card.trap && (
                    <div
                      className="rounded-lg p-3 mb-4"
                      style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}
                    >
                      <p className="text-xs font-semibold mb-1" style={{ color: '#F59E0B' }}>⚠️ Common Trap</p>
                      <p className="text-sm" style={{ color: '#9A9A9A' }}>{card.trap}</p>
                    </div>
                  )}

                  {/* Practice link */}
                  <Link
                    href={`/practice?focus=${card.tags[0]}`}
                    className="flex items-center gap-1 text-sm font-medium"
                    style={{ color: '#3B82F6' }}
                  >
                    Practice this topic <ArrowRight size={14} />
                  </Link>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
