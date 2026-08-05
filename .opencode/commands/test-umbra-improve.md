---
description: 觸發測試版「影子架構改善 (Umbra Improve)」工作流，獨立角色分工 (Orchestrator 協調 / Analyzer 分析 / Architecture 藍圖 / Reviewer 審查 / TDD 測試 / Coder 投影 / Code Reviewer 雙軸審查)。支援 --scope、--auto、--worktree、--ask、--direct、--all 旗標。
agent: test-umbra-improve-orchestrator
dependencies:
  - agents/test-umbra-improve-analyzer
  - agents/test-umbra-architecture
  - agents/test-umbra-reviewer
  - agents/test-umbra-tdd-engineer
  - agents/test-umbra-coder
  - agents/test-umbra-code-reviewer
---

# 🪄 Command: /test-umbra-improve

`/test-umbra-improve` 指令用於觸發重構測試版的「影子架構改善 (Umbra Improve)」工作流。

這個工作流專注於改善既有系統架構，採用解耦的角色分工：
1. **`test-umbra-improve-orchestrator` (協調者)**：編排全流程與處理雙重同意關卡（關卡①與關卡②），不直接讀寫藍圖與程式碼。
2. **`test-umbra-improve-analyzer` (分析師)**：唯讀掃描源碼與熱點，產出 HTML 報告與深化候選。
3. **`test-umbra-architecture` (架構師)**：根據選定的候選演進藍圖並宣告 seam 清單。
4. **`test-umbra-reviewer` (藍圖審核專家)**：審查藍圖品質並自主修復。
5. **`test-umbra-tdd-engineer` (TDD 工程師)**：只寫測試，驗證紅燈 FAIL 證據。
6. **`test-umbra-coder` (工程師)**：投影實作使測試轉綠。
7. **`test-umbra-code-reviewer` (兩軸審查專家)**：依據 BASE_SHA 與 Spec 進行 Standards + Spec 雙軸審查。

## Workflow Entrypoint & Flags

1. 啟動 `test-umbra-improve-orchestrator` agent。
2. 將使用者的附加 Prompt 與旗標轉交給協調者：
   - `--scope <路徑>`：限定分析範圍。
   - `--auto`：僅跳過「同意關卡 ②」（投影前批准）；**關卡 ① 候選選擇永遠由使用者決定**。
   - `--worktree`：修改前建立獨立 Git Worktree，全流程於該 Worktree 下進行。
   - `--ask`：選定候選後先調用 `grilling` 技能深度質詢。
   - `--direct`：跳過 `@test-umbra-reviewer` 藍圖審查階段。
   - `--all`：階段一指示 `@test-umbra-architecture` 使用 Repomix 打包全量讀取藍圖。
3. `test-umbra-improve-orchestrator` 依旗標組合調用各 Subagent 完成任務。
