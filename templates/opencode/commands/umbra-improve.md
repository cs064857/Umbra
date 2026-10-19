---
description: 觸發「影子架構改善 (Umbra Improve)」工作流，獨立角色分工 (Orchestrator 協調 / Analyzer 分析 / Architecture 藍圖 / Reviewer 審查 [選用] / TDD 測試 / Coder 投影 / Code Reviewer 雙軸審查)。支援 --scope、--auto、--worktree、--ask、--review、--all 旗標。
agent: umbra-improve-orchestrator
---

# 🪄 Command: /umbra-improve

`/umbra-improve` 指令用於觸發「影子架構改善 (Umbra Improve)」工作流。

這個工作流專注於改善既有系統架構，採用解耦的角色分工：
1. **`umbra-improve-orchestrator` (協調者)**：編排全流程與處理雙重同意關卡（關卡①與關卡②），不直接讀寫藍圖與程式碼。
2. **`umbra-improve-analyzer` (分析師)**：唯讀掃描源碼與熱點，產出 HTML 報告與深化候選。
3. **`umbra-architecture` (架構師)**：根據選定的候選演進藍圖、宣告 seam 清單並產出定案快照。
4. **`umbra-reviewer` (藍圖審核專家，選用 — 需帶 `--review`)**：審查藍圖品質與指標最優性並自主修復。
5. **`umbra-tdd-engineer` (TDD 工程師)**：只寫測試，驗證紅燈 FAIL 證據。
6. **`umbra-coder` (工程師)**：投影實作使測試轉綠。
7. **`umbra-code-reviewer` (兩軸審查專家)**：依據 BASE_SHA 與 Spec 進行 Standards + Spec 雙軸審查。

## Workflow Entrypoint & Flags

1. 啟動 `umbra-improve-orchestrator` agent。
2. 將使用者的附加 Prompt 與旗標轉交給協調者：
   - `--scope <路徑>`：限定分析範圍。
   - `--auto`：僅跳過「同意關卡 ②」（投影前批准）；**關卡 ① 候選選擇永遠由使用者決定**。
   - `--worktree`：修改前建立獨立 Git Worktree，全流程於該 Worktree 下進行。
   - `--ask`：選定候選後先調用 `grilling` 技能深度質詢。
   - `--review`：啟用 `@umbra-reviewer` 藍圖審查階段（預設為不啟用，直接由 `@umbra-architecture` 定案）。
   - `--all`：階段一指示 `@umbra-architecture` 使用 Repomix 打包全量讀取藍圖。
3. `umbra-improve-orchestrator` 依旗標組合調用各 Subagent 完成任務。
