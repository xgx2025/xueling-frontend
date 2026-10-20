# 单词记忆接口补充

以下接口均需要登录，沿用项目统一的 `{ code, msg, data }` 响应格式。

## GET `/study/history?days=7`

`days` 只接受 `7` 或 `30`，默认 `7`。返回按日期升序排列的每日记录，包含没有评分的日期。

```json
{
  "date": "2026-10-20",
  "reviewCount": 12,
  "newWords": 5,
  "studyTimeMs": 84000,
  "dueRecallAttempts": 4,
  "dueRecallRate": 0.75,
  "dueBacklog": 8
}
```

- 日期按用户当前学习设置中的时区划分。`newWords` 是当天首次评分的单词数；`reviewCount` 是评分次数，包含短时重学。
- `studyTimeMs` 为客户端上报的评分用时之和，单次最多计入 10 分钟，属于近似学习用时。
- 正式到期回忆仅统计评分前状态为 `REVIEW` 且已经到期的卡片；评分大于 1 视为回忆成功。样本数为 0 时，`dueRecallRate` 为 `null`。
- 历史 `dueBacklog` 从评分记录回算，表示该日结束时到期未复习的卡片数；今天表示当前数。

## GET `/study/review-counts`

返回当前已学习单词按每词累计评分次数分组的数量：`once`、`twice`、`threeToFive`、`sixOrMore`。每个词只计入一个分组。

## 词书覆盖率字段

词书列表和详情新增 `learningCoverage`，计算方式是 `learnedCount / wordCount × 100` 的整数百分比，表示学习覆盖率。旧字段 `mastery` 暂时返回相同数值以兼容旧客户端；它不表示单词已掌握。
