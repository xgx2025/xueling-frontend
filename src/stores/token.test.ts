// @vitest-environment jsdom
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import axios from 'axios'
import { useTokenStore } from './token'

describe('access token storage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    setActivePinia(createPinia())
  })

  it('removes legacy persisted tokens and keeps new tokens in memory', () => {
    localStorage.setItem('access_token', 'old-token')
    const store = useTokenStore()
    expect(store.accessToken).toBe('')
    expect(localStorage.getItem('access_token')).toBeNull()
    store.setToken('new-token')
    expect(store.accessToken).toBe('new-token')
    expect(localStorage.getItem('access_token')).toBeNull()
  })

  it('restores a session once using the HttpOnly refresh cookie', async () => {
    const post = vi.spyOn(axios, 'post').mockResolvedValue({ data: { code: 0, data: 'fresh-token' } })
    const store = useTokenStore()
    expect(await store.restoreSession()).toBe(true)
    expect(await store.restoreSession()).toBe(true)
    expect(post).toHaveBeenCalledTimes(1)
    expect(store.accessToken).toBe('fresh-token')
    expect(localStorage.getItem('access_token')).toBeNull()
  })
})
