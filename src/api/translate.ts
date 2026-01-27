/**
 * 翻译 API 服务层
 * 提供单词翻译相关的 API 接口
 */

import request from '@/utils/request'
import type { ApiResponse } from '@/types/auth'
import type { TranslateResult, Translation } from '@/types/translate'
import type { WordDictionary } from '@/types/wordbook'

/**
 * 翻译单词
 * @param text 要翻译的单词
 * @returns Promise<ApiResponse<TranslateResult>> 返回翻译结果
 */
export const translateText = async (text: string): Promise<ApiResponse<TranslateResult | null>> => {
  try {
    const response = await request.get<any, ApiResponse<WordDictionary>>('/dictionary', {
      params: { word: text.trim() }
    })
    
    if (response.code === 0 && response.data) {
      const wordData = response.data
      
      // 解析释义，提取词性和含义
      const translations: Translation[] = parseTranslations(wordData.meaning)
      
      // 将 WordDictionary 转换为 TranslateResult 格式
      const result: TranslateResult = {
        word: wordData.word,
        phonetic: wordData.phonetic,
        translations,
        examples: []
      }
      
      return {
        code: 0,
        msg: '翻译成功',
        data: result
      }
    }
    
    return {
      code: response.code,
      msg: response.msg || '未找到该单词',
      data: null
    }
  } catch (error: any) {
    console.error('翻译API错误:', error)
    return {
      code: -1,
      msg: error.message || '翻译失败',
      data: null
    }
  }
}

/**
 * 解析释义字符串，提取词性和含义
 * 支持格式：
 * - "n. 苹果；水果"
 * - "v. 跑步；奔跑"
 * - "adj. 美丽的；漂亮的"
 * - "苹果；水果" (无词性)
 */
function parseTranslations(meaning: string): Translation[] {
  if (!meaning) {
    return []
  }

  // 词性正则：匹配 n. v. adj. adv. prep. conj. pron. 等
  const posPattern = /^([a-z]+\.)\s*/i
  
  // 检查是否包含词性
  const match = meaning.match(posPattern)
  
  if (match && match[1]) {
    // 有词性的情况
    const pos = match[1]
    const meaningsText = meaning.substring(match[0].length)
    const meanings = meaningsText.split(/[；;]/).map(m => m.trim()).filter(m => m)
    
    return [{
      pos,
      meanings
    }]
  } else {
    // 无词性的情况，默认使用 n.
    const meanings = meaning.split(/[；;]/).map(m => m.trim()).filter(m => m)
    
    return [{
      pos: 'n.',
      meanings
    }]
  }
}

/**
 * 批量翻译单词
 * @param words 单词列表（逗号分隔）
 * @returns Promise<ApiResponse<WordDictionary[]>> 返回翻译结果列表
 */
export const batchTranslate = (words: string): Promise<ApiResponse<WordDictionary[]>> => {
  return request.post('/wordbooks/match', null, {
    params: { words }
  })
}
