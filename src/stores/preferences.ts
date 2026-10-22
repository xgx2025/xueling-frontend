import { defineStore } from 'pinia'
import { computed, reactive, watch } from 'vue'
import { useUserStore } from './user'

interface Preferences {
  wordLookupEnabled: boolean
}

const defaults: Preferences = {
  wordLookupEnabled: true,
}

const storageKey = (userId: string) => `xueling:preferences:v1:${userId}`

function loadPreferences(userId: string | undefined): Preferences {
  if (!userId) return { ...defaults }
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey(userId)) || '{}') as Partial<Preferences>
    return {
      wordLookupEnabled: typeof saved.wordLookupEnabled === 'boolean'
        ? saved.wordLookupEnabled
        : defaults.wordLookupEnabled,
    }
  } catch {
    return { ...defaults }
  }
}

export const usePreferencesStore = defineStore('preferences', () => {
  const userStore = useUserStore()
  const userId = computed(() => userStore.userInfo?.id)
  const preferences = reactive<Preferences>({ ...defaults })

  watch(userId, id => Object.assign(preferences, loadPreferences(id)), { immediate: true })

  function setPreference<K extends keyof Preferences>(key: K, value: Preferences[K]) {
    preferences[key] = value
    if (!userId.value) return
    try {
      localStorage.setItem(storageKey(userId.value), JSON.stringify(preferences))
    } catch {
      // Browser storage may be unavailable; the choice still applies for this session.
    }
  }

  return { preferences, setPreference }
})
