export interface SM2Card {
  repetitions: number
  interval: number
  easeFactor: number
  nextReviewDate: number
}

// quality: 0-5 (0=blackout, 3=correct with difficulty, 5=perfect)
export function sm2Update(card: SM2Card, quality: number): SM2Card {
  let { repetitions, interval, easeFactor } = card

  if (quality < 3) {
    repetitions = 0
    interval = 1
  } else {
    if (repetitions === 0) interval = 1
    else if (repetitions === 1) interval = 6
    else interval = Math.round(interval * easeFactor)
    repetitions += 1
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

  const nextReviewDate = Date.now() + interval * 24 * 60 * 60 * 1000

  return { repetitions, interval, easeFactor, nextReviewDate }
}

export function isDue(nextReviewDate: number): boolean {
  return Date.now() >= nextReviewDate
}
