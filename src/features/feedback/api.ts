import request from '@/utils/request'
import type { ApiResponse } from '@/types/auth'
import type { CreateFeedback, Feedback, FeedbackStatus } from './types'

export const createFeedback = (data: CreateFeedback): Promise<ApiResponse<Feedback>> =>
  request.post('/feedback', data)

export const getMyFeedback = (page = 1): Promise<ApiResponse<Feedback[]>> =>
  request.get('/feedback/mine', { params: { page } })

export const getFeedbackAdminAccess = (): Promise<ApiResponse<boolean>> =>
  request.get('/feedback/admin/access')

export const getAdminFeedback = (page = 1, status?: FeedbackStatus): Promise<ApiResponse<Feedback[]>> =>
  request.get('/feedback/admin', { params: { page, status } })

export const updateFeedback = (id: string, data: { status: FeedbackStatus; adminReply?: string }): Promise<ApiResponse<Feedback>> =>
  request.put(`/feedback/admin/${id}`, data)
