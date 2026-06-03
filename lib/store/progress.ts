import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserProgress, ErrorEntry, VocabEntry, Session } from '@/types'
import { sm2Update } from '@/lib/utils/sm2'
import { vocabularyData } from '@/lib/data/vocabulary'

function todayString(): string {
  return new Date().toISOString().slice(0, 10)
}

function yesterdayString(): string {
  const d = new Date()
  d.setDate(d.getDate() - 1)
  return d.toISOString().slice(0, 10)
}

const initialVocab: VocabEntry[] = vocabularyData.map((v) => ({
  ...v,
  repetitions: 0,
  interval: 1,
  easeFactor: 2.5,
  nextReviewDate: Date.now(),
  status: 'new' as const,
}))

const defaultProgress: UserProgress = {
  streak: 0,
  lastSessionDate: '',
  totalMinutes: 0,
  xpTotal: 0,
  xpToday: 0,
  xpTodayDate: '',
  level: 'B1',
  errorProfile: [],
  vocabularyLedger: initialVocab,
  phrasalVerbsProgress: {},
  seenInsights: [],
  seenTheoryCards: [],
  sessions: [],
  completedExercises: [],
  streakFreezeAvailable: true,
  lastFreezeDate: '',
}

interface ProgressStore {
  progress: UserProgress

  // Session
  startSession: () => void
  endSession: (score: number, total: number, durationMinutes: number) => void

  // Errors
  addError: (
    entry: Omit<ErrorEntry, 'repetitions' | 'interval' | 'easeFactor' | 'nextReviewDate' | 'resolved'>
  ) => void
  reviewError: (exerciseId: string, quality: number) => void
  resolveError: (exerciseId: string) => void

  // Vocabulary
  reviewVocab: (id: string, quality: number) => void

  // Phrasal Verbs
  updatePhrasalVerbStatus: (id: string, status: 'new' | 'learning' | 'known') => void

  // Content
  markInsightSeen: (id: string) => void
  markExerciseCompleted: (id: string) => void

  // Streak
  updateStreak: () => void
  useStreakFreeze: () => void

  // XP
  addXP: (amount: number) => void

  // Computed helpers
  getWeakPoints: () => Array<{ subcategory: string; count: number; entries: ErrorEntry[] }>
  getDueErrors: () => ErrorEntry[]
  getDueVocab: () => VocabEntry[]
  getTodayStats: () => { accuracy: number; exercisesDone: number; errorsAdded: number }
}

export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      progress: defaultProgress,

      startSession: () => {
        get().updateStreak()
      },

      endSession: (score, total, durationMinutes) => {
        const today = todayString()
        const xpGained = score * 10 + (total - score) * 5 + 50
        const errorsAdded = get().progress.errorProfile.filter(
          (e) => e.timestamp > Date.now() - 60 * 60 * 1000
        ).length

        const session: Session = {
          date: Date.now(),
          score,
          total,
          durationMinutes,
          errorsAdded,
          xpGained,
        }

        set((s) => ({
          progress: {
            ...s.progress,
            sessions: [session, ...s.progress.sessions].slice(0, 100),
            totalMinutes: s.progress.totalMinutes + durationMinutes,
            lastSessionDate: today,
          },
        }))

        get().addXP(xpGained)
      },

      addError: (entry) => {
        const tomorrow = Date.now() + 24 * 60 * 60 * 1000
        const newEntry: ErrorEntry = {
          ...entry,
          repetitions: 0,
          interval: 1,
          easeFactor: 2.5,
          nextReviewDate: tomorrow,
          resolved: false,
        }

        set((s) => {
          const existing = s.progress.errorProfile.find(
            (e) => e.exerciseId === entry.exerciseId
          )
          if (existing) {
            return {
              progress: {
                ...s.progress,
                errorProfile: s.progress.errorProfile.map((e) =>
                  e.exerciseId === entry.exerciseId
                    ? { ...e, timestamp: Date.now(), repetitions: 0, interval: 1, nextReviewDate: tomorrow }
                    : e
                ),
              },
            }
          }
          return {
            progress: {
              ...s.progress,
              errorProfile: [newEntry, ...s.progress.errorProfile],
            },
          }
        })
      },

      reviewError: (exerciseId, quality) => {
        set((s) => ({
          progress: {
            ...s.progress,
            errorProfile: s.progress.errorProfile.map((e) => {
              if (e.exerciseId !== exerciseId) return e
              const updated = sm2Update(
                {
                  repetitions: e.repetitions,
                  interval: e.interval,
                  easeFactor: e.easeFactor,
                  nextReviewDate: e.nextReviewDate,
                },
                quality
              )
              return {
                ...e,
                ...updated,
                resolved: quality >= 4,
              }
            }),
          },
        }))
      },

      resolveError: (exerciseId) => {
        set((s) => ({
          progress: {
            ...s.progress,
            errorProfile: s.progress.errorProfile.map((e) =>
              e.exerciseId === exerciseId ? { ...e, resolved: true } : e
            ),
          },
        }))
      },

      reviewVocab: (id, quality) => {
        set((s) => ({
          progress: {
            ...s.progress,
            vocabularyLedger: s.progress.vocabularyLedger.map((v) => {
              if (v.id !== id) return v
              const updated = sm2Update(
                {
                  repetitions: v.repetitions,
                  interval: v.interval,
                  easeFactor: v.easeFactor,
                  nextReviewDate: v.nextReviewDate,
                },
                quality
              )
              let status: VocabEntry['status'] = v.status
              if (quality < 2) status = 'weak'
              else if (updated.repetitions >= 5) status = 'mastered'
              else if (updated.repetitions >= 3) status = 'strong'
              else status = 'weak'

              return { ...v, ...updated, status }
            }),
          },
        }))
        get().addXP(8)
      },

      updatePhrasalVerbStatus: (id, status) => {
        set((s) => ({
          progress: {
            ...s.progress,
            phrasalVerbsProgress: {
              ...s.progress.phrasalVerbsProgress,
              [id]: { status },
            },
          },
        }))
      },

      markInsightSeen: (id) => {
        set((s) => {
          if (s.progress.seenInsights.includes(id)) return s
          return {
            progress: {
              ...s.progress,
              seenInsights: [...s.progress.seenInsights, id],
            },
          }
        })
      },

      markExerciseCompleted: (id) => {
        set((s) => {
          if (s.progress.completedExercises.includes(id)) return s
          return {
            progress: {
              ...s.progress,
              completedExercises: [...s.progress.completedExercises, id],
            },
          }
        })
      },

      updateStreak: () => {
        const { progress } = get()
        const today = todayString()
        const yesterday = yesterdayString()

        if (progress.lastSessionDate === today) return

        let newStreak = progress.streak
        if (progress.lastSessionDate === yesterday) {
          newStreak = progress.streak + 1
        } else if (progress.lastSessionDate === '') {
          newStreak = 1
        } else {
          // More than 1 day ago
          if (progress.streakFreezeAvailable && progress.lastFreezeDate !== today) {
            // Auto-use freeze if available and not used today
            newStreak = Math.max(1, progress.streak)
          } else {
            newStreak = 1
          }
        }

        set((s) => ({
          progress: {
            ...s.progress,
            streak: newStreak,
            lastSessionDate: today,
          },
        }))

        // First session of the day XP bonus
        get().addXP(20)
      },

      useStreakFreeze: () => {
        const today = todayString()
        set((s) => ({
          progress: {
            ...s.progress,
            streakFreezeAvailable: false,
            lastFreezeDate: today,
          },
        }))
      },

      addXP: (amount) => {
        const today = todayString()
        set((s) => {
          const isNewDay = s.progress.xpTodayDate !== today
          return {
            progress: {
              ...s.progress,
              xpTotal: s.progress.xpTotal + amount,
              xpToday: isNewDay ? amount : s.progress.xpToday + amount,
              xpTodayDate: today,
            },
          }
        })
      },

      getWeakPoints: () => {
        const { errorProfile } = get().progress
        const unresolved = errorProfile.filter((e) => !e.resolved)
        const grouped: Record<string, ErrorEntry[]> = {}

        for (const entry of unresolved) {
          if (!grouped[entry.subcategory]) grouped[entry.subcategory] = []
          grouped[entry.subcategory].push(entry)
        }

        return Object.entries(grouped)
          .map(([subcategory, entries]) => ({ subcategory, count: entries.length, entries }))
          .sort((a, b) => b.count - a.count)
      },

      getDueErrors: () => {
        const { errorProfile } = get().progress
        return errorProfile.filter((e) => !e.resolved && Date.now() >= e.nextReviewDate)
      },

      getDueVocab: () => {
        const { vocabularyLedger } = get().progress
        return vocabularyLedger.filter((v) => Date.now() >= v.nextReviewDate)
      },

      getTodayStats: () => {
        const today = todayString()
        const { sessions, errorProfile } = get().progress
        const todaySessions = sessions.filter(
          (s) => new Date(s.date).toISOString().slice(0, 10) === today
        )
        const totalExercises = todaySessions.reduce((sum, s) => sum + s.total, 0)
        const correctExercises = todaySessions.reduce((sum, s) => sum + s.score, 0)
        const errorsAdded = errorProfile.filter(
          (e) => new Date(e.timestamp).toISOString().slice(0, 10) === today
        ).length

        return {
          accuracy: totalExercises > 0 ? Math.round((correctExercises / totalExercises) * 100) : 0,
          exercisesDone: totalExercises,
          errorsAdded,
        }
      },
    }),
    {
      name: 'englsh-progress',
    }
  )
)
