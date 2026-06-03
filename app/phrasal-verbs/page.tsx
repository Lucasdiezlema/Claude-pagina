'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Search, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useProgressStore } from '@/lib/store/progress'
import { phrasalVerbs, phrasalVerbExercises } from '@/lib/data/phrasal-verbs'
import type { PhrasalVerb } from '@/types'

const categories = ['all', 'movement', 'communication', 'relationships', 'work', 'emotions', 'time'] as const
const levels = ['all', 'B1', 'B2', 'C1'] as const

function PhrasalVerbCard({ pv, onStatusChange }: { pv: PhrasalVerb; onStatusChange: (id: string, status: 'new' | 'learning' | 'known') => void }) {
  const [expanded, setExpanded] = useState(false)
  const { progress } = useProgressStore()
  const savedStatus = progress.phrasalVerbsProgress[pv.id]?.status ?? pv.status

  const statusColors: Record<string, { background: string; color: string }> = {
    new: { background: 'rgba(85,85,85,0.15)', color: '#555555' },
    learning: { background: 'rgba(245,158,11,0.12)', color: '#F59E0B' },
    known: { background: 'rgba(34,197,94,0.12)', color: '#22C55E' },
  }

  const levelColors: Record<string, string> = {
    B1: '#22C55E',
    B2: '#3B82F6',
    C1: '#8B5CF6',
  }

  return (
    <div
      className="rounded-xl p-5 transition-all"
      style={{ background: '#161616', border: '1px solid #2A2A2A' }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <span className="text-base font-bold" style={{ color: '#F0F0F0' }}>
            {pv.verb} <span style={{ color: '#3B82F6' }}>{pv.particle}</span>
          </span>
          {pv.separable && (
            <span className="ml-2 text-xs" style={{ color: '#555555' }}>separable</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-1.5 py-0.5 rounded font-semibold"
            style={{ background: `${levelColors[pv.level]}22`, color: levelColors[pv.level] }}
          >
            {pv.level}
          </span>
          <span
            className="text-xs px-2 py-0.5 rounded font-medium cursor-pointer"
            style={statusColors[savedStatus]}
            onClick={() => {
              const next: Record<string, 'new' | 'learning' | 'known'> = { new: 'learning', learning: 'known', known: 'new' }
              onStatusChange(pv.id, next[savedStatus] ?? 'new')
            }}
          >
            {savedStatus}
          </span>
        </div>
      </div>

      <div className="h-px my-3" style={{ background: '#2A2A2A' }} />

      <p className="text-sm mb-1" style={{ color: '#F0F0F0' }}>{pv.meaning}</p>
      <p className="text-xs mb-3" style={{ color: '#9A9A9A' }}>{pv.translation}</p>

      {!expanded ? (
        <button
          className="text-xs"
          style={{ color: '#3B82F6' }}
          onClick={() => setExpanded(true)}
        >
          Show examples →
        </button>
      ) : (
        <div className="space-y-2">
          {pv.examples.map((ex, i) => (
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
      )}
    </div>
  )
}

function TheoryTab() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<typeof categories[number]>('all')
  const [level, setLevel] = useState<typeof levels[number]>('all')
  const { updatePhrasalVerbStatus } = useProgressStore()

  const filtered = phrasalVerbs.filter((pv) => {
    const matchSearch = search === '' ||
      `${pv.verb} ${pv.particle}`.toLowerCase().includes(search.toLowerCase()) ||
      pv.meaning.toLowerCase().includes(search.toLowerCase()) ||
      pv.translation.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'all' || pv.category === category
    const matchLevel = level === 'all' || pv.level === level
    return matchSearch && matchCat && matchLevel
  })

  return (
    <div>
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: '#555555' }} />
          <input
            type="text"
            placeholder="Search phrasal verbs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg text-sm"
            style={{
              background: '#161616',
              border: '1px solid #2A2A2A',
              color: '#F0F0F0',
              outline: 'none',
            }}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all"
              style={{
                background: category === cat ? 'rgba(59,130,246,0.15)' : '#161616',
                color: category === cat ? '#3B82F6' : '#9A9A9A',
                border: `1px solid ${category === cat ? '#3B82F6' : '#2A2A2A'}`,
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Level filters */}
      <div className="flex gap-2 mb-6">
        {levels.map((l) => (
          <button
            key={l}
            onClick={() => setLevel(l)}
            className="px-3 py-1 rounded text-xs font-semibold transition-all"
            style={{
              background: level === l ? 'rgba(139,92,246,0.15)' : '#1E1E1E',
              color: level === l ? '#8B5CF6' : '#555555',
              border: `1px solid ${level === l ? '#8B5CF6' : '#2A2A2A'}`,
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((pv) => (
          <PhrasalVerbCard
            key={pv.id}
            pv={pv}
            onStatusChange={updatePhrasalVerbStatus}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12" style={{ color: '#555555' }}>
          No phrasal verbs match your filters.
        </div>
      )}
    </div>
  )
}

function PracticeTab() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [answered, setAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [completed, setCompleted] = useState(false)
  const { addError, addXP } = useProgressStore()

  const shuffledExercises = [...phrasalVerbExercises].slice(0, 10)
  const current = shuffledExercises[currentIndex]

  function handleAnswer(answer: string) {
    if (answered) return
    setSelectedAnswer(answer)
    setAnswered(true)

    const isCorrect = answer === current.correctAnswer
    if (isCorrect) {
      setScore((s) => s + 1)
      addXP(10)
    } else {
      addXP(5)
      addError({
        exerciseId: current.id,
        category: 'phrasal-verb',
        subcategory: 'phrasal-verb',
        userAnswer: answer,
        correctAnswer: current.correctAnswer,
        explanation: current.explanation,
        question: current.question,
        timestamp: Date.now(),
      })
    }
  }

  function handleNext() {
    if (currentIndex < shuffledExercises.length - 1) {
      setCurrentIndex((i) => i + 1)
      setSelectedAnswer(null)
      setAnswered(false)
    } else {
      setCompleted(true)
    }
  }

  if (completed) {
    return (
      <div className="text-center py-12">
        <div className="text-4xl mb-4">{score >= 8 ? '🎉' : '💪'}</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: '#F0F0F0' }}>
          {score}/{shuffledExercises.length} correct
        </h3>
        <button
          onClick={() => {
            setCurrentIndex(0)
            setSelectedAnswer(null)
            setAnswered(false)
            setScore(0)
            setCompleted(false)
          }}
          className="mt-4 px-4 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: '#3B82F6', color: '#fff' }}
        >
          Practice Again
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-xl">
      {/* Progress */}
      <div className="mb-6">
        <div className="flex justify-between text-xs mb-2" style={{ color: '#555555' }}>
          <span>{currentIndex + 1} / {shuffledExercises.length}</span>
          <span style={{ color: '#22C55E' }}>{score} correct</span>
        </div>
        <div className="h-1 rounded-full" style={{ background: '#2A2A2A' }}>
          <div
            className="h-1 rounded-full"
            style={{ background: '#3B82F6', width: `${(currentIndex / shuffledExercises.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div
        className="rounded-xl p-6 mb-4"
        style={{
          background: '#161616',
          border: `1px solid ${answered
            ? selectedAnswer === current.correctAnswer ? '#22C55E' : '#EF4444'
            : '#2A2A2A'}`,
        }}
      >
        <p
          className="text-base mb-5"
          style={{ color: '#F0F0F0', fontFamily: 'var(--font-jetbrains, monospace)' }}
        >
          {current.question}
        </p>

        {current.options ? (
          <div className="space-y-2">
            {current.options.map((opt) => {
              const isCorrect = opt === current.correctAnswer
              const isSelected = opt === selectedAnswer

              return (
                <button
                  key={opt}
                  onClick={() => handleAnswer(opt)}
                  disabled={answered}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm transition-all"
                  style={{
                    background: answered
                      ? isCorrect ? 'rgba(34,197,94,0.12)' : isSelected ? 'rgba(239,68,68,0.12)' : '#1E1E1E'
                      : '#1E1E1E',
                    border: answered
                      ? isCorrect ? '1px solid #22C55E' : isSelected ? '1px solid #EF4444' : '1px solid #2A2A2A'
                      : '1px solid #2A2A2A',
                    color: answered
                      ? isCorrect ? '#22C55E' : isSelected ? '#EF4444' : '#555555'
                      : '#9A9A9A',
                    cursor: answered ? 'default' : 'pointer',
                  }}
                >
                  {opt}
                </button>
              )
            })}
          </div>
        ) : (
          <input
            type="text"
            placeholder="Type your answer..."
            className="w-full px-4 py-3 rounded-lg text-sm"
            style={{
              background: '#1E1E1E',
              border: '1px solid #2A2A2A',
              color: '#F0F0F0',
              outline: 'none',
            }}
            disabled={answered}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !answered) {
                handleAnswer(e.currentTarget.value.trim())
              }
            }}
          />
        )}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className="rounded-xl p-4 mb-4 animate-fade-in"
          style={{
            background: selectedAnswer === current.correctAnswer ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            border: `1px solid ${selectedAnswer === current.correctAnswer ? '#22C55E33' : '#EF444433'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            {selectedAnswer === current.correctAnswer
              ? <CheckCircle size={14} style={{ color: '#22C55E' }} />
              : <XCircle size={14} style={{ color: '#EF4444' }} />}
            <span className="text-sm font-semibold" style={{ color: selectedAnswer === current.correctAnswer ? '#22C55E' : '#EF4444' }}>
              {selectedAnswer === current.correctAnswer ? 'Correct!' : `Incorrect — Answer: ${current.correctAnswer}`}
            </span>
          </div>
          <p className="text-sm" style={{ color: '#9A9A9A' }}>{current.explanation}</p>
        </div>
      )}

      {answered && (
        <button
          onClick={handleNext}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold"
          style={{ background: '#3B82F6', color: '#fff' }}
        >
          {currentIndex < shuffledExercises.length - 1 ? 'Next' : 'Finish'}
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  )
}

function PhrasalVerbsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get('tab')
  const [activeTab, setActiveTab] = useState<'theory' | 'practice'>(
    tabParam === 'practice' ? 'practice' : 'theory'
  )

  const knownCount = phrasalVerbs.filter((pv) => {
    const { progress } = useProgressStore.getState()
    return progress.phrasalVerbsProgress[pv.id]?.status === 'known'
  }).length

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-xl font-bold mb-1" style={{ color: '#F0F0F0' }}>Phrasal Verbs</h1>
          <p className="text-sm" style={{ color: '#9A9A9A' }}>
            {phrasalVerbs.length} verbs · {knownCount} known
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 p-1 rounded-lg" style={{ background: '#161616', border: '1px solid #2A2A2A', width: 'fit-content' }}>
        {(['theory', 'practice'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab)
              router.replace(`/phrasal-verbs${tab === 'practice' ? '?tab=practice' : ''}`)
            }}
            className="px-4 py-2 rounded text-sm font-medium capitalize transition-all"
            style={{
              background: activeTab === tab ? '#1E1E1E' : 'transparent',
              color: activeTab === tab ? '#F0F0F0' : '#555555',
              border: activeTab === tab ? '1px solid #2A2A2A' : '1px solid transparent',
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'theory' ? <TheoryTab /> : <PracticeTab />}
    </div>
  )
}

export default function PhrasalVerbsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center" style={{ color: '#555555' }}>Loading...</div>}>
      <PhrasalVerbsContent />
    </Suspense>
  )
}
