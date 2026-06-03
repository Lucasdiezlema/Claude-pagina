export type ExerciseType =
  | 'complete-sentence'
  | 'detect-mistake'
  | 'natural-vs-unnatural'
  | 'rebuild-sentence'
  | 'translation-challenge'
  | 'choose-best-option'
  | 'phrasal-fill'

export type ErrorCategory = 'grammar' | 'vocabulary' | 'naturalness' | 'phrasal-verb'

export interface Exercise {
  id: string
  type: ExerciseType
  level: 'B1' | 'B2' | 'C1'
  category: ErrorCategory
  subcategory: string
  question: string
  options?: string[]
  correctAnswer: string | number
  explanation: string
  nativeTip?: string
  words?: string[] // for rebuild-sentence
}

export interface ErrorEntry {
  exerciseId: string
  category: ErrorCategory
  subcategory: string
  userAnswer: string
  correctAnswer: string
  explanation: string
  nativeTip?: string
  question: string
  timestamp: number
  repetitions: number
  interval: number      // days until next review
  easeFactor: number    // SM-2 ease factor (default 2.5)
  nextReviewDate: number // timestamp
  resolved: boolean
}

export interface VocabEntry {
  id: string
  word: string
  phonetic: string
  translation: string
  definition: string
  examples: string[]
  level: 'B1' | 'B2' | 'C1'
  tag: string
  commonMistake?: string
  repetitions: number
  interval: number
  easeFactor: number
  nextReviewDate: number
  status: 'new' | 'weak' | 'strong' | 'mastered'
}

export interface PhrasalVerb {
  id: string
  verb: string
  particle: string
  meaning: string
  translation: string
  examples: string[]
  level: 'B1' | 'B2' | 'C1'
  category: 'movement' | 'communication' | 'relationships' | 'work' | 'emotions' | 'time'
  separable: boolean
  status: 'new' | 'learning' | 'known'
}

export interface PhrasalVerbExercise {
  id: string
  type: 'fill-blank' | 'choose-particle' | 'match-meaning' | 'translate'
  phrasalVerbId: string
  question: string
  options?: string[]
  correctAnswer: string
  explanation: string
}

export interface TheoryCard {
  id: string
  title: string
  subtitle: string
  rule: string
  examples: Array<{ correct: string; incorrect?: string; note?: string }>
  trap?: string
  tags: string[]
  level: 'B1' | 'B2' | 'C1'
}

export interface RealEnglishInsight {
  id: string
  title: string
  content: string
  examples: Array<{ text: string; correct: boolean; note?: string }>
  category: 'collocation' | 'false-friend' | 'register' | 'idiom' | 'preposition'
  seen: boolean
}

export interface Session {
  date: number
  score: number
  total: number
  durationMinutes: number
  errorsAdded: number
  xpGained: number
}

export interface UserProgress {
  streak: number
  lastSessionDate: string    // YYYY-MM-DD
  totalMinutes: number
  xpTotal: number
  xpToday: number
  xpTodayDate: string        // YYYY-MM-DD
  level: 'B1' | 'B1+' | 'B2' | 'B2+' | 'C1'
  errorProfile: ErrorEntry[]
  vocabularyLedger: VocabEntry[]
  phrasalVerbsProgress: Record<string, { status: 'new' | 'learning' | 'known' }>
  seenInsights: string[]
  seenTheoryCards: string[]
  sessions: Session[]
  completedExercises: string[]  // exercise ids completed correctly
  streakFreezeAvailable: boolean
  lastFreezeDate: string
}
