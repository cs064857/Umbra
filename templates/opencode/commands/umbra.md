---
description: 觸發「影子架構 (The Architect)」工作流，預設 3 角色分工 (Orchestrator 協調 / Architecture 藍圖 / Coder 投影)，可選 Reviewer 審查。支援 --auto、--worktree、--ask、--review、--all、--tdd、--teamwork 旗標。
agent: umbra-orchestrator
---

# 🪄 Command: /umbra

`/umbra` 指令專門用來執行**「顛倒真理來源 (Inverting the Source of Truth)」**的實驗性編程範式。

這個工作流將職責徹底解耦為獨立角色（預設不啟用 Reviewer，按需透過 `--review` 開啟）：
1. **`umbra-orchestrator` (協調者)**：負責編排全流程、處理旗標與使用者進行溝通 bridge，不直接讀寫藍圖與程式碼。
2. **`umbra-architecture` (架構師)**：專注於全量/按需閱讀 `.blueprint/` 與 `.scout/`，進行架構推演與藍圖修訂，並產出定案快照。
3. **`umbra-reviewer` (審核專家，選用 — 需帶 `--review`)**：負責審查藍圖品質、可行性與指標最優性，必要時自主修復與優化藍圖。
4. **`umbra-coder` (工程師)**：負責接收定案藍圖並投影回專案原始碼，執行測試驗證。

## Workflow Entrypoint & Flags

1. 啟動 `umbra-orchestrator` agent。
2. 把使用者所有的附加 Prompt 與旗標轉交給協調者：
   - `--auto`：跳過藍圖修改後的用戶確認關卡，自動執行投影發派。
   - `--worktree`：修改前先開啟獨立 Git Worktree，並於該 Worktree 目錄下進行所有演進、審核、投影與完成度檢查。
   - `--ask`：進行藍圖演進前，先調用 `grilling` 技能進行需求訪談對齊。
   - `--review`：啟用 `@umbra-reviewer` 藍圖審查階段（預設為不啟用，直接由 `@umbra-architecture` 定案推進至確認或投影）。
   - `--all`：階段一指示 `@umbra-architecture` 使用 Repomix 打包全量讀取 `.blueprint/` + `.scout/`。
   - `--tdd`：啟用 TDD 模式，藍圖定案後先調用 `@umbra-tdd-engineer` 編寫紅燈測試，隨後才派發 `@umbra-coder` 將測試轉綠。
   - `--teamwork`：啟用團隊協同模式，雙階段 Teamwork 流水線（藍圖推演與代碼投影均支援 Batched DAG 並行、雙階段審查與 HITL 暫停）。
3. `umbra-orchestrator` 依據旗標組合調用各 Subagent 完成任務。
