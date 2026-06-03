'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, XCircle, ArrowRight, Zap, RotateCcw } from 'lucide-react'
import { useProgressStore } from '@/lib/store/progress'
import { exercises } from '@/lib/data/exercises'
import { phrasalVerbExercises } from '@/lib/data/phrasal-verbs'
import type { Exercise, ErrorEntry } from '@/types'

type SessionExercise = {
  id: string
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  nativeTip?: string
  category: ErrorEntry['category']
  subcategory: string
  type: string
}

function buildDailySession(
  progress: { errorProfile: ErrorEntry[]; vocabularyLedger: Array<{ id: string; word: string; nextReviewDate: number }>; completedExercises: string[] }
): SessionExercise[] {
  const session: SessionExercise[] = []

  // 1. Due error reviews (up to 3)
  const dueErrors = progress.errorProfile
    .filter((e) => !e.resolved && Date.now() >= e.nextReviewDate)
    .slice(0, 3)

  for (const err of dueErrors) {
    const ex = exercises.find((e) => e.id === err.exerciseId)
    if (ex) {
      session.push({
        id: ex.id,
        question: ex.question,
        options: ex.options,
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        nativeTip: ex.nativeTip,
        category: ex.category,
        subcategory: ex.subcategory,
        type: ex.type,
      })
    }
  }

  // 2. Due vocabulary (up to 2) — shown as questions
  const dueVocab = progress.vocabularyLedger
    .filter((v) => Date.now() >= v.nextReviewDate)
    .slice(0, 2)

  for (const vocab of dueVocab) {
    session.push({
      id: `vocab-${vocab.id}`,
      question: `What does "${vocab.word}" mean?`,
      options: undefined,
      correctAnswer: vocab.id,
      explanation: `"${vocab.word}" = vocabulary flashcard`,
      category: 'vocabulary',
      subcategory: 'vocab-review',
      type: 'vocab-review',
    })
  }

  // 3. New exercises (up to 5)
  const completedSet = new Set(progress.completedExercises)
  const available = exercises.filter((e) => !completedSet.has(e.id))
  const shuffled = [...available].sort(() => Math.random() - 0.5).slice(0, 5)

  for (const ex of shuffled) {
    if (!session.find((s) => s.id === ex.id)) {
      session.push({
        id: ex.id,
        question: ex.question,
        options: ex.options,
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        nativeTip: ex.nativeTip,
        category: ex.category,
        subcategory: ex.subcategory,
        type: ex.type,
      })
    }
  }

  // 4. One phrasal verb exercise
  const pvEx = [...phrasalVerbExercises].sort(() => Math.random() - 0.5)[0]
  if (pvEx) {
    session.push({
      id: pvEx.id,
      question: pvEx.question,
      options: pvEx.options,
      correctAnswer: pvEx.correctAnswer,
      explanation: pvEx.explanation,
      category: 'phrasal-verb',
      subcategory: 'phrasal-verb',
      type: pvEx.type,
    })
  }

  return session
}

function buildWeakPointSession(
  errorProfile: ErrorEntry[],
  focus?: string
): SessionExercise[] {
  const errors = focus
    ? errorProfile.filter((e) => !e.resolved && e.subcategory === focus)
    : errorProfile.filter((e) => !e.resolved)

  return errors.slice(0, 10).map((err) => {
    const ex = exercises.find((e) => e.id === err.exerciseId)
    if (ex) {
      return {
        id: ex.id,
        question: ex.question,
        options: ex.options,
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        nativeTip: ex.nativeTip,
        category: ex.category,
        subcategory: ex.subcategory,
        type: ex.type,
      }
    }
    return {
      id: err.exerciseId,
      question: err.question,
      options: undefined,
      correctAnswer: err.correctAnswer,
      explanation: err.explanation,
      category: err.category,
      subcategory: err.subcategory,
      type: 'review',
    }
  })
}

function ExerciseCard({
  exercise,
  onAnswer,
  index,
  total,
}: {
  exercise: SessionExercise
  onAnswer: (correct: boolean, userAnswer: string) => void
  index: number
  total: number
}) {
  const [selected, setSelected] = useState<number | string | null>(null)
  const [answered, setAnswered] = useState(false)

  function handleSelect(opt: string | number, idx: number) {
    if (answered) return
    setSelected(idx)
    setAnswered(true)

    const isCorrect =
      typeof exercise.correctAnswer === 'number'
        ? idx === exercise.correctAnswer
        : opt === exercise.correctAnswer

    onAnswer(isCorrect, String(opt))
  }

  const isVocabReview = exercise.type === 'vocab-review'
  const correctIdx = typeof exercise.correctAnswer === 'number' ? exercise.correctAnswer : -1

  return (
    <div className="animate-fade-in">
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs" style={{ color: '#555555' }}>
            Exercise {index + 1} of {total}
          </span>
          <span className="text-xs font-medium" style={{ color: '#3B82F6' }}>
            {Math.round(((index) / total) * 100)}%
          </span>
        </div>
        <div className="h-1 rounded-full" style={{ background: '#2A2A2A' }}>
          <div
            className="h-1 rounded-full transition-all duration-300"
            style={{ background: '#3B82F6', width: `${((index) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* Question card */}
      <div
        className="rounded-xl p-6 mb-4"
        style={(() => {
          const isCorrectAnswer = answered && typeof selected === 'number' &&
            (selected === correctIdx || (typeof exercise.correctAnswer === 'string' && exercise.options?.[selected as number] === exercise.correctAnswer))
          const isWrongAnswer = answered && typeof selected === 'number' && !isCorrectAnswer
          return {
            background: isCorrectAnswer ? 'rgba(34,197,94,0.05)' : isWrongAnswer ? 'rgba(239,68,68,0.05)' : '#161616',
            border: isCorrectAnswer ? '1px solid #22C55E' : isWrongAnswer ? '1px solid #EF4444' : '1px solid #2A2A2A',
          }
        })()}
      >
        <div className="flex items-center gap-2 mb-4">
          <span
            className="text-xs px-2 py-1 rounded font-medium"
            style={{
              background: 'rgba(59,130,246,0.12)',
              color: '#3B82F6',
            }}
          >
            {exercise.subcategory.replace(/-/g, ' ')}
          </span>
          <span className="text-xs" style={{ color: '#555555' }}>
            {exercise.type.replace(/-/g, ' ')}
          </span>
        </div>

        <p
          className="text-base mb-5 leading-relaxed"
          style={{
            color: '#F0F0F0',
            fontFamily: 'var(--font-jetbrains, monospace)',
            fontWeight: 400,
          }}
        >
          {exercise.question}
        </p>

        {isVocabReview ? (
          <div className="space-y-2">
            <p style={{ color: '#9A9A9A' }} className="text-sm">
              This is a vocabulary flashcard. Review in the Vocabulary section for full spaced repetition.
            </p>
            <button
              onClick={() => onAnswer(true, 'reviewed')}
              className="px-4 py-2 rounded-lg text-sm font-medium"
              style={{ background: '#22C55E', color: '#000' }}
            >
              Mark Reviewed
            </button>
          </div>
        ) : exercise.options ? (
          <div className="space-y-2">
            {exercise.options.map((opt, idx) => {
              const isCorrectOpt =
                typeof exercise.correctAnswer === 'number'
                  ? idx === exercise.correctAnswer
                  : opt === exercise.correctAnswer
              const isSelected = selected === idx

              let optStyle: React.CSSProperties = {
                background: '#1E1E1E',
                border: '1px solid #2A2A2A',
                color: '#9A9A9A',
                cursor: answered ? 'default' : 'pointer',
              }

              if (answered) {
                if (isCorrectOpt) {
                  optStyle = {
                    background: 'rgba(34,197,94,0.12)',
                    border: '1px solid #22C55E',
                    color: '#22C55E',
                    cursor: 'default',
                  }
                } else if (isSelected && !isCorrectOpt) {
                  optStyle = {
                    background: 'rgba(239,68,68,0.12)',
                    border: '1px solid #EF4444',
                    color: '#EF4444',
                    cursor: 'default',
                  }
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(opt, idx)}
                  className="w-full text-left px-4 py-3 rounded-lg text-sm transition-all"
                  style={optStyle}
                  onMouseEnter={(e) => {
                    if (!answered) {
                      e.currentTarget.style.borderColor = '#3B82F6'
                      e.currentTarget.style.color = '#F0F0F0'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!answered) {
                      e.currentTarget.style.borderColor = '#2A2A2A'
                      e.currentTarget.style.color = '#9A9A9A'
                    }
                  }}
                >
                  <span
                    className="inline-flex items-center justify-center w-6 h-6 rounded text-xs font-bold mr-3"
                    style={{
                      background: answered && isCorrectOpt
                        ? '#22C55E'
                        : answered && isSelected
                          ? '#EF4444'
                          : '#2A2A2A',
                      color: answered && (isCorrectOpt || isSelected) ? '#000' : '#9A9A9A',
                    }}
                  >
                    {String.fromCharCode(65 + idx)}
                  </span>
                  {opt}
                </button>
              )
            })}
          </div>
        ) : (
          <div className="space-y-2">
            <input
              type="text"
              placeholder="Type your answer..."
              className="w-full px-4 py-3 rounded-lg text-sm"
              style={{
                background: '#1E1E1E',
                border: '1px solid #2A2A2A',
                color: '#F0F0F0',
                outline: 'none',
                fontFamily: 'var(--font-jetbrains, monospace)',
              }}
              disabled={answered}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !answered) {
                  const val = e.currentTarget.value.trim()
                  const isCorrect =
                    val.toLowerCase() === String(exercise.correctAnswer).toLowerCase()
                  onAnswer(isCorrect, val)
                  setAnswered(true)
                }
              }}
            />
            <p className="text-xs" style={{ color: '#555555' }}>Press Enter to submit</p>
          </div>
        )}
      </div>

      {/* Explanation */}
      {answered && (
        <div
          className="rounded-xl p-5 animate-fade-in"
          style={{
            background: typeof selected === 'number'
              ? (selected === correctIdx || (typeof exercise.correctAnswer === 'string' && exercise.options?.[selected as number] === exercise.correctAnswer))
                ? 'rgba(34,197,94,0.08)'
                : 'rgba(239,68,68,0.08)'
              : 'rgba(34,197,94,0.08)',
            border: `1px solid ${typeof selected === 'number'
              ? (selected === correctIdx || (typeof exercise.correctAnswer === 'string' && exercise.options?.[selected as number] === exercise.correctAnswer))
                ? '#22C55E33'
                : '#EF444433'
              : '#22C55E33'}`,
          }}
        >
          <div className="flex items-center gap-2 mb-2">
            {typeof selected === 'number' && (selected === correctIdx || (typeof exercise.correctAnswer === 'string' && exercise.options?.[selected as number] === exercise.correctAnswer))
              ? <CheckCircle size={16} style={{ color: '#22C55E' }} />
              : <XCircle size={16} style={{ color: '#EF4444' }} />}
            <span
              className="text-sm font-semibold"
              style={{
                color: typeof selected === 'number'
                  ? (selected === correctIdx || (typeof exercise.correctAnswer === 'string' && exercise.options?.[selected as number] === exercise.correctAnswer))
                    ? '#22C55E'
                    : '#EF4444'
                  : '#22C55E',
              }}
            >
              {typeof selected === 'number'
                ? (selected === correctIdx || (typeof exercise.correctAnswer === 'string' && exercise.options?.[selected as number] === exercise.correctAnswer))
                  ? 'Correct!'
                  : 'Incorrect'
                : 'Submitted'}
            </span>
          </div>
          <p className="text-sm mb-2" style={{ color: '#9A9A9A' }}>{exercise.explanation}</p>
          {exercise.nativeTip && (
            <p className="text-xs mt-2 p-2 rounded" style={{ background: 'rgba(59,130,246,0.08)', color: '#3B82F6' }}>
              💡 {exercise.nativeTip}
            </p>
          )}
        </div>
      )}
    </div>
  )
}

function SessionSummary({
  score,
  total,
  errorsAdded,
  xpGained,
  onRestart,
}: {
  score: number
  total: number
  errorsAdded: number
  xpGained: number
  onRestart: () => void
}) {
  const accuracy = total > 0 ? Math.round((score / total) * 100) : 0

  return (
    <div className="text-center animate-fade-in max-w-md mx-auto">
      <div className="text-5xl mb-4">{accuracy >= 80 ? '🎉' : accuracy >= 60 ? '💪' : '📚'}</div>
      <h2 className="text-2xl font-bold mb-2" style={{ color: '#F0F0F0' }}>Session Complete!</h2>
      <p className="text-sm mb-8" style={{ color: '#9A9A9A' }}>
        {accuracy >= 80 ? 'Excellent work!' : accuracy >= 60 ? 'Good effort. Keep practicing!' : 'Keep going — practice makes perfect.'}
      </p>

      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #2A2A2A' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: '#22C55E' }}>{score}/{total}</div>
          <div className="text-xs" style={{ color: '#555555' }}>Correct</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #2A2A2A' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: '#F59E0B' }}>+{xpGained}</div>
          <div className="text-xs" style={{ color: '#555555' }}>XP Gained</div>
        </div>
        <div className="rounded-xl p-4" style={{ background: '#161616', border: '1px solid #2A2A2A' }}>
          <div className="text-2xl font-bold mb-1" style={{ color: '#EF4444' }}>{errorsAdded}</div>
          <div className="text-xs" style={{ color: '#555555' }}>Errors Added</div>
        </div>
      </div>

      <div className="flex gap-3 justify-center">
        <button
          onClick={onRestart}
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: '#1E1E1E', border: '1px solid #2A2A2A', color: '#9A9A9A' }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6'; e.currentTarget.style.color = '#F0F0F0' }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A'; e.currentTarget.style.color = '#9A9A9A' }}
        >
          <RotateCcw size={14} />
          Practice Again
        </button>
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all"
          style={{ background: '#3B82F6', color: '#fff' }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB' }}
          onMouseLeave={(e) => { e.currentTarget.style.background = '#3B82F6' }}
        >
          Back to Dashboard
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  )
}

function PracticeContent() {
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const focus = searchParams.get('focus') || undefined

  const { progress, addError, reviewError, markExerciseCompleted, addXP, endSession } = useProgressStore()

  const [sessionExercises, setSessionExercises] = useState<SessionExercise[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [errorsAdded, setErrorsAdded] = useState(0)
  const [xpGained, setXpGained] = useState(0)
  const [sessionComplete, setSessionComplete] = useState(false)
  const [lastCorrect, setLastCorrect] = useState<boolean | null>(null)
  const startTime = useRef(Date.now())

  useEffect(() => {
    if (mode === 'daily' || mode === 'weak-points') {
      const session = mode === 'daily'
        ? buildDailySession(progress)
        : buildWeakPointSession(progress.errorProfile, focus)
      setSessionExercises(session)
      setCurrentIndex(0)
      setScore(0)
      setErrorsAdded(0)
      setXpGained(0)
      setSessionComplete(false)
      startTime.current = Date.now()
    }
  }, [mode, focus]) // eslint-disable-line react-hooks/exhaustive-deps

  function handleAnswer(correct: boolean, userAnswer: string) {
    const ex = sessionExercises[currentIndex]
    const xp = correct ? 10 : 5

    setLastCorrect(correct)
    setXpGained((prev) => prev + xp)
    addXP(xp)

    if (correct) {
      setScore((prev) => prev + 1)
      markExerciseCompleted(ex.id)
      // If it was a due error, mark as reviewed
      const isError = progress.errorProfile.find((e) => e.exerciseId === ex.id)
      if (isError) {
        reviewError(ex.id, 4)
      }
    } else {
      setErrorsAdded((prev) => prev + 1)
      // Add to error profile (or update if exists)
      const baseExercise = exercises.find((e) => e.id === ex.id)
      if (baseExercise) {
        addError({
          exerciseId: ex.id,
          category: ex.category,
          subcategory: ex.subcategory,
          userAnswer,
          correctAnswer: String(ex.correctAnswer),
          explanation: ex.explanation,
          nativeTip: ex.nativeTip,
          question: ex.question,
          timestamp: Date.now(),
        })
      }
      // If it was a due error, mark as still needing review
      const isError = progress.errorProfile.find((e) => e.exerciseId === ex.id)
      if (isError) {
        reviewError(ex.id, 1)
      }
    }
  }

  function handleNext() {
    if (currentIndex < sessionExercises.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setLastCorrect(null)
    } else {
      const durationMinutes = Math.max(1, Math.round((Date.now() - startTime.current) / 60000))
      endSession(score, sessionExercises.length, durationMinutes)
      setSessionComplete(true)
    }
  }

  function handleRestart() {
    const session = mode === 'daily'
      ? buildDailySession(progress)
      : buildWeakPointSession(progress.errorProfile, focus)
    setSessionExercises(session)
    setCurrentIndex(0)
    setScore(0)
    setErrorsAdded(0)
    setXpGained(0)
    setSessionComplete(false)
    setLastCorrect(null)
    startTime.current = Date.now()
  }

  // Browse mode (no ?mode param)
  if (!mode) {
    const categories = [...new Set(exercises.map((e) => e.subcategory))]
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Zap size={20} style={{ color: '#3B82F6' }} />
          <h1 className="text-xl font-bold" style={{ color: '#F0F0F0' }}>Practice Mode</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Link
            href="/practice?mode=daily"
            className="flex items-center gap-4 p-5 rounded-xl transition-all"
            style={{ background: '#161616', border: '1px solid #2A2A2A' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#3B82F6' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(59,130,246,0.12)' }}
            >
              <Zap size={20} style={{ color: '#3B82F6' }} />
            </div>
            <div>
              <div className="font-semibold mb-1" style={{ color: '#F0F0F0' }}>Daily Session</div>
              <div className="text-sm" style={{ color: '#9A9A9A' }}>Mixed exercises based on your progress</div>
            </div>
          </Link>

          <Link
            href="/practice?mode=weak-points"
            className="flex items-center gap-4 p-5 rounded-xl transition-all"
            style={{ background: '#161616', border: '1px solid #2A2A2A' }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#EF4444' }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = '#2A2A2A' }}
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(239,68,68,0.12)' }}
            >
              <XCircle size={20} style={{ color: '#EF4444' }} />
            </div>
            <div>
              <div className="font-semibold mb-1" style={{ color: '#F0F0F0' }}>Weak Points</div>
              <div className="text-sm" style={{ color: '#9A9A9A' }}>Review your error profile</div>
            </div>
          </Link>
        </div>

        <h2 className="text-sm font-semibold uppercase tracking-wider mb-4" style={{ color: '#555555' }}>
          All Categories
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {categories.map((cat) => {
            const count = exercises.filter((e) => e.subcategory === cat).length
            return (
              <div
                key={cat}
                className="p-4 rounded-xl"
                style={{ background: '#161616', border: '1px solid #2A2A2A' }}
              >
                <div className="text-sm font-medium capitalize mb-1" style={{ color: '#F0F0F0' }}>
                  {cat.replace(/-/g, ' ')}
                </div>
                <div className="text-xs" style={{ color: '#555555' }}>{count} exercises</div>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  if (sessionExercises.length === 0) {
    return (
      <div className="p-6 md:p-8 max-w-4xl mx-auto text-center">
        <p className="text-lg" style={{ color: '#9A9A9A' }}>
          {mode === 'weak-points'
            ? "No weak points to practice yet! Complete some exercises first."
            : "No exercises available. Check back soon!"}
        </p>
        <Link
          href="/"
          className="mt-4 inline-flex items-center gap-2 text-sm"
          style={{ color: '#3B82F6' }}
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-8">
        <Link
          href="/practice"
          className="flex items-center gap-2 text-sm"
          style={{ color: '#555555' }}
        >
          <ArrowLeft size={16} />
          Exit
        </Link>
        <div className="flex items-center gap-3">
          <span className="text-sm" style={{ color: '#9A9A9A' }}>
            Score: <span style={{ color: '#22C55E', fontWeight: 600 }}>{score}</span>
          </span>
          <div
            className="flex items-center gap-1 text-sm px-2 py-1 rounded"
            style={{ background: 'rgba(245,158,11,0.12)', color: '#F59E0B' }}
          >
            <Zap size={12} />
            +{xpGained} XP
          </div>
        </div>
      </div>

      {sessionComplete ? (
        <SessionSummary
          score={score}
          total={sessionExercises.length}
          errorsAdded={errorsAdded}
          xpGained={xpGained + 50}
          onRestart={handleRestart}
        />
      ) : (
        <div>
          <ExerciseCard
            key={`${sessionExercises[currentIndex].id}-${currentIndex}`}
            exercise={sessionExercises[currentIndex]}
            onAnswer={handleAnswer}
            index={currentIndex}
            total={sessionExercises.length}
          />

          {lastCorrect !== null && (
            <div className="mt-4 flex justify-end animate-fade-in">
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all"
                style={{ background: '#3B82F6', color: '#fff' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2563EB' }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#3B82F6' }}
              >
                {currentIndex < sessionExercises.length - 1 ? (
                  <>Next <ArrowRight size={14} /></>
                ) : (
                  <>Finish <CheckCircle size={14} /></>
                )}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function PracticePage() {
  return (
    <Suspense fallback={
      <div className="p-8 text-center" style={{ color: '#555555' }}>Loading...</div>
    }>
      <PracticeContent />
    </Suspense>
  )
}
