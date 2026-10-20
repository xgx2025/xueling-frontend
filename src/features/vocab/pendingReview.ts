import type { SubmitStudyReview } from './types'

function storageKey(userId: string) {
  return `study.pending-review.${userId}`
}

function validReview(value: unknown): value is SubmitStudyReview {
  if (!value || typeof value !== 'object') return false
  const review = value as Partial<SubmitStudyReview>
  return typeof review.wordId === 'string' && /^[1-9]\d*$/.test(review.wordId)
    && Number.isInteger(review.rating) && review.rating! >= 1 && review.rating! <= 4
    && Number.isInteger(review.expectedVersion) && review.expectedVersion! >= 0
    && typeof review.requestId === 'string'
    && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(review.requestId)
    && Number.isInteger(review.elapsedMs) && review.elapsedMs! >= 0 && review.elapsedMs! <= 600_000
}

export function restorePendingReview(userId?: string): SubmitStudyReview | null {
  if (!userId) return null
  try {
    const raw = sessionStorage.getItem(storageKey(userId))
    if (!raw) return null
    const review: unknown = JSON.parse(raw)
    if (validReview(review)) return review
    sessionStorage.removeItem(storageKey(userId))
  } catch { /* 存储不可用时，当前页面仍能继续在线提交。 */ }
  return null
}

export function persistPendingReview(userId: string | undefined, review: SubmitStudyReview) {
  if (!userId) return
  try { sessionStorage.setItem(storageKey(userId), JSON.stringify(review)) } catch { /* 继续在线提交。 */ }
}

export function clearPendingReview(userId?: string) {
  if (!userId) return
  try { sessionStorage.removeItem(storageKey(userId)) } catch { /* 无需阻断学习。 */ }
}
