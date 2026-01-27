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

// 单词本 VO（用于列表展示）
export interface WordBookVo {
  id: string           // 单词本ID
  name: string         // 单词本名称
  wordCount: number    // 单词总数
  mastery: number      // 掌握度（0-100）
  color?: string       // 封面背景色
  icon?: string        // 封面图标
}

// 创建单词本 DTO
export interface CreateWordBookDTO {
  name: string         // 单词本名称
  color: string        // 封面背景色
  icon: string         // 封面图标
}

// 单词字典（用于智能匹配）
export interface WordDictionary {
  id: number           // 主键ID
  word: string         // 单词
  meaning: string      // 释义
  phonetic: string     // 音标
}

// 单词 VO
export interface WordVO {
  id: number
  word: string
  meaning: string
  phonetic: string
  createTime: string
}

// 单词本详情 VO
export interface WordBookDetailVO {
  id: number
  name: string
  wordCount: number
  mastery: number
  wordList: WordVO[]
}

// 添加单词到单词本 DTO
export interface AddWordsToWordBookDTO {
  wordBookId: string
  wordIds: string[]
}

// 移除单词从单词本 DTO
export interface RemoveWordsFromWordBookDTO {
  wordBookId: string
  wordIds: string[]
}
