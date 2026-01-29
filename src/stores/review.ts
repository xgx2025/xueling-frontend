import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useReviewStore = defineStore('review', () => {
  const reviewIds = ref<string[]>([])
  const bookName = ref<string>('')

  // Initialize from localStorage
  const storedIds = localStorage.getItem('review_ids')
  const storedName = localStorage.getItem('review_book_name')
  
  if (storedIds) {
    try {
        reviewIds.value = JSON.parse(storedIds)
    } catch (e) {
        console.error('Failed to parse review ids', e)
    }
  }
  
  if (storedName) {
    bookName.value = storedName
  }

  function setReviewData(ids: string[], name: string) {
    reviewIds.value = ids
    bookName.value = name
    localStorage.setItem('review_ids', JSON.stringify(ids))
    localStorage.setItem('review_book_name', name)
  }

  function clearReviewData() {
    reviewIds.value = []
    bookName.value = ''
    localStorage.removeItem('review_ids')
    localStorage.removeItem('review_book_name')
  }

  return {
    reviewIds,
    bookName,
    setReviewData,
    clearReviewData
  }
})
