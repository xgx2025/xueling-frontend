// @vitest-environment jsdom
import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import FamiliarityPanel from './FamiliarityPanel.vue'

const api = vi.hoisted(() => ({ getStudyFamiliarity: vi.fn(), getWordBooks: vi.fn() }))
vi.mock('@/features/vocab/api', () => api)

const result = {
  learnedCount: 3, learningCount: 1, consolidatingCount: 1, stableCount: 1,
  dueCount: 1, wordCount: 3, page: 1, pageSize: 20,
  words: [{ wordId: '1', word: 'apple', meaning: '苹果', stage: 'LEARNING', due: false,
    dueAt: '2026-10-22T00:00:00Z', lapseCount: 0, lastRating: 3, stabilityDays: null }],
  attentionWords: []
}

describe('familiarity panel', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.getWordBooks.mockResolvedValue({ data: [{ id: '12', name: '四级词书' }] })
    api.getStudyFamiliarity.mockResolvedValue({ data: result })
  })

  it('loads stage and book filters without losing the deduplicated overview', async () => {
    const wrapper = mount(FamiliarityPanel, { global: { stubs: { RouterLink: true } } })
    await flushPromises()
    expect(wrapper.text()).toContain('已学习')
    expect(wrapper.text()).toContain('apple')
    await wrapper.find('.segment-action.stable').trigger('click')
    await flushPromises()
    expect(api.getStudyFamiliarity).toHaveBeenLastCalledWith({ bookId: undefined, stage: 'STABLE', page: 1 })
    await wrapper.find('select').setValue('12')
    await flushPromises()
    expect(api.getStudyFamiliarity).toHaveBeenLastCalledWith({ bookId: '12', stage: 'STABLE', page: 1 })
    wrapper.unmount()
  })
})
