// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { clearPendingReview, persistPendingReview, restorePendingReview } from './pendingReview'
import type { SubmitStudyReview } from './types'

const review: SubmitStudyReview = {
  wordId: '1234567890123456789',
  rating: 3,
  expectedVersion: 2,
  requestId: '123e4567-e89b-42d3-a456-426614174000',
  elapsedMs: 3500
}

describe('pending study review recovery', () => {
  beforeEach(() => sessionStorage.clear())

  it('restores the exact request after a page reload and keeps users separate', () => {
    persistPendingReview('7', review)
    expect(restorePendingReview('7')).toEqual(review)
    expect(restorePendingReview('8')).toBeNull()
    clearPendingReview('7')
    expect(restorePendingReview('7')).toBeNull()
  })

  it('discards damaged requests instead of replaying them', () => {
    sessionStorage.setItem('study.pending-review.7', JSON.stringify({ ...review, requestId: 'invalid' }))
    expect(restorePendingReview('7')).toBeNull()
    expect(sessionStorage.getItem('study.pending-review.7')).toBeNull()
  })
})
