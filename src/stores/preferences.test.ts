// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { nextTick } from 'vue'
import { usePreferencesStore } from './preferences'
import { useUserStore } from './user'

describe('account preferences', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  it('restores each account’s lookup choice without carrying it to another account', async () => {
    const userStore = useUserStore()
    const preferencesStore = usePreferencesStore()
    userStore.setUserInfo({ id: 'user-1', email: 'one@example.com' })
    await nextTick()
    preferencesStore.setPreference('wordLookupEnabled', false)

    userStore.setUserInfo({ id: 'user-2', email: 'two@example.com' })
    await nextTick()
    expect(preferencesStore.preferences.wordLookupEnabled).toBe(true)

    userStore.setUserInfo({ id: 'user-1', email: 'one@example.com' })
    await nextTick()
    expect(preferencesStore.preferences.wordLookupEnabled).toBe(false)

    setActivePinia(createPinia())
    useUserStore().setUserInfo({ id: 'user-1', email: 'one@example.com' })
    await nextTick()
    expect(usePreferencesStore().preferences.wordLookupEnabled).toBe(false)
  })
})
