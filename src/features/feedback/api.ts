import request from '@/utils/request'
import type { ApiResponse } from '@/types/auth'
import type { CreateFeedback, Feedback } from './types'

export const createFeedback = (data: CreateFeedback): Promise<ApiResponse<Feedback>> =>
  request.post('/feedback', data)

export const getMyFeedback = (page = 1): Promise<ApiResponse<Feedback[]>> =>
  request.get('/feedback/mine', { params: { page } })
