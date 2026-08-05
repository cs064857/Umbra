---
description: 觸發測試版「影子架構 (The Architect)」工作流，4 角色分工 (Orchestrator 協調 / Architecture 藍圖 / Reviewer 審查 / Coder 投影)。支援 --auto、--worktree、--ask、--direct、--all 旗標。
agent: test-umbra-orchestrator
dependencies:
  - agents/test-umbra-architecture
  - agents/test-umbra-reviewer
  - agents/test-umbra-coder
---

# 🪄 Command: /test-umbra

`/test-umbra` 指令用於觸發重構測試版的「影子架構 (The Architect)」工作流。

這個工作流將職責徹底解耦為 4 個獨立角色：
1. **`test-umbra-orchestrator` (協調者)**：負責編排全流程、處理旗標與使用者進行溝通 bridge，不直接讀寫藍圖與程式碼。
2. **`test-umbra-architecture` (架構師)**：專注於全量/按需閱讀 `.blueprint/` 與 `.scout/`，進行架構推演與藍圖修訂。
3. **`test-umbra-reviewer` (審核專家)**：負責審查藍圖品質與可行性，必要時自主修復藍圖。
4. **`test-umbra-coder` (工程師)**：負責接收審核後的藍圖並投影回專案原始碼，執行測試驗證。

## Workflow Entrypoint & Flags

1. 啟動 `test-umbra-orchestrator` agent。
2. 將使用者的附加 Prompt 與旗標轉交給協調者：
   - `--auto`：跳過藍圖修改後的用戶確認關卡，自動執行投影發派。
   - `--worktree`：修改前先開啟獨立 Git Worktree，並於該 Worktree 目錄下進行所有演進、審核、投影與完成度檢查。
   - `--ask`：進行藍圖演進前，先調用 `grilling` 技能進行需求訪談對齊。
   - `--direct`：跳過 `@test-umbra-reviewer` 審查階段，直接推進至確認或投影。
   - `--all`：階段一指示 `@test-umbra-architecture` 使用 Repomix 全量打包讀取 `.blueprint/` + `.scout/`。
3. `test-umbra-orchestrator` 依據旗標組合調用各 Subagent 完成任務。
