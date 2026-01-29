/**
 * 单词本 API 服务层
 * 提供单词本相关的 API 接口
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/types/auth'
import type { CreateWordBookDTO, WordDictionary, WordBookVo, WordBookDetailVO, AddWordsToWordBookDTO, RemoveWordsFromWordBookDTO, WordFamilyNodeVO } from '@/types/wordbook'

/**
 * 创建一个单词本
 * @param data 创建单词本数据对象 (DTO)
 * @returns Promise<ApiResponse<string>> 返回创建结果
 */
export const createWordBook = (data: CreateWordBookDTO): Promise<ApiResponse<string>> => {
  return request.post('/wordbooks', data)
}

/**
 * 添加单词到单词本
 * @param data 添加单词数据对象
 * @returns Promise<ApiResponse<string>> 返回结果
 */
export const addWordsToBook = (data: AddWordsToWordBookDTO): Promise<ApiResponse<string>> => {
  return request.post('/wordbooks/word', data)
}

/**
 * 从单词本中移除单词
 * @param data 移除单词数据对象
 * @returns Promise<ApiResponse<string>> 返回结果
 */
export const removeWordsFromBook = (data: RemoveWordsFromWordBookDTO): Promise<ApiResponse<string>> => {
  return request.delete(`/wordbooks/word`, {
    data: data
  })
}

/**
 * 获取单词本详情
 * @param id 单词本ID
 * @returns Promise<ApiResponse<WordBookDetailVO>> 返回单词本详情
 */
export const getWordBookDetail = (id: string | number): Promise<ApiResponse<WordBookDetailVO>> => {
  return request.get(`/wordbooks/${id}`)
}

/**
 * 获取单词本列表
 * @returns Promise<ApiResponse<WordBookVo[]>> 返回单词本列表
 */
export const getWordBooks = (): Promise<ApiResponse<WordBookVo[]>> => {
  return request.get('/wordbooks/all')
}

/**
 * 智能匹配单词
 * @param words 单词列表（逗号分隔的字符串）
 * @returns Promise<ApiResponse<WordDictionary[]>> 返回匹配的单词列表
 */
export const matchWords = (words: string): Promise<ApiResponse<WordDictionary[]>> => {
  return request.post('/wordbooks/match', null, {
    params: { words }
  })
}

/**
 * 根据ID列表获取单词详情
 * @param ids ID列表（逗号分隔）
 * @returns Promise<ApiResponse<WordDictionary[]>>
 */
export const getWordsByIds = (ids: string): Promise<ApiResponse<WordDictionary[]>> => {
  // 将逗号分隔的字符串转换为数组
  const wordIds = ids.split(',')
  return request.post('/word-review/word-detail', {
     wordIds
  })
}

/**
 * 获取单词的单词族（各种词性）
 * @param word 单词
 * @return 单词族
 */
export const getWordFamily = (word: string): Promise<ApiResponse<WordFamilyNodeVO>> => {
    return request.get('/word-review/family', { params: { word } })
}
