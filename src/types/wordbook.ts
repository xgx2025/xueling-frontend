/**
 * 单词本相关的 TypeScript 类型定义
 */

// 单词本信息
export interface WordBook {
  id: number           // 单词本ID
  name: string         // 单词本名称
  wordCount?: number   // 单词数量
  createTime?: string  // 创建时间
  updateTime?: string  // 更新时间
}

// 创建单词本 DTO
export interface CreateWordBookDTO {
  name: string         // 单词本名称
}

// 单词字典（用于智能匹配）
export interface WordDictionary {
  id: number           // 主键ID
  word: string         // 单词
  meaning: string      // 释义
  phonetic: string     // 音标
}
