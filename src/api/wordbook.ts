/**
 * 单词本 API 服务层
 * 提供单词本相关的 API 接口
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/types/auth'
import type { CreateWordBookDTO, WordDictionary } from '@/types/wordbook'

/**
 * 创建一个单词本
 * @param name 单词本名称
 * @returns Promise<ApiResponse<string>> 返回创建结果
 */
export const createWordBook = (name: string): Promise<ApiResponse<string>> => {
  return request.post('/wordbooks', null, {
    params: { name }
  })
}

/**
 * 创建一个单词本（使用 DTO）
 * @param dto 创建单词本数据
 * @returns Promise<ApiResponse<string>> 返回创建结果
 */
export const createWordBookWithDTO = (dto: CreateWordBookDTO): Promise<ApiResponse<string>> => {
  return request.post('/wordbooks', null, {
    params: { name: dto.name }
  })
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
