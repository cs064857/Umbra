---
description: 觸發「影子架構 (The Architect)」工作流，進行意圖驅動的軟體修改，禁止 AI 直接寫源碼。可在指令後加上 --auto 旗標跳過藍圖修改後的用戶確認關卡。
agent: umbra-orchestrator
dependencies:
  - agents/umbra-reviewer
  - agents/umbra-coder
---

# 🪄 Command: /umbra

`/umbra` 指令專門用來執行**「顛倒真理來源 (Inverting the Source of Truth)」**的實驗性編程範式。

這個指令強烈要求 AI 系統**不可以**直接搜尋代碼，也**不可以**第一步就動手改代碼。
一切的修改與設計，都必須先透過閱讀、更新 `.blueprint/` 目錄下的「影子架構」後，再以投影 (Projecting) 的方式作用到 `src/` 中。

## Workflow Entrypoint

1. 啟動 `umbra-orchestrator` agent。
2. 把使用者所有的附加原始 Prompt（包含可選的 `--auto` 旗標），完整地轉交給這位首席架構師。
3. `umbra-orchestrator` 完成藍圖修改與審核後，預設會向使用者展示詳細資訊並等待確認同意；若 Prompt 中包含 `--auto` 旗標，則會自動續行實施投影。
