---
description: 觸發「影子架構 (The Architect)」工作流，進行意圖驅動的軟體修改，禁止 AI 直接寫源碼。支援 --auto、--worktree、--ask、--review、--all、--tdd 旗標。
agent: umbra-orchestrator
dependencies:
  - agents/umbra-reviewer
  - agents/umbra-coder
  - agents/umbra-tdd-engineer
---

# 🪄 Command: /umbra

`/umbra` 指令專門用來執行**「顛倒真理來源 (Inverting the Source of Truth)」**的實驗性編程範式。

這個指令強烈要求 AI 系統**不可以**直接搜尋代碼，也**不可以**第一步就動手改代碼。
一切的修改與設計，都必須先透過閱讀、更新 `.blueprint/` 目錄下的「影子架構」後，再以投影 (Projecting) 的方式作用到專案真實程式碼中。

這個工作流將職責徹底解耦為 4 個獨立角色：
1. **`umbra-orchestrator` (協調者)**：負責編排全流程、處理旗標與使用者進行溝通 bridge，不直接讀寫藍圖與程式碼。
2. **`umbra-architecture` (架構師)**：專注於全量/按需閱讀 `.blueprint/` 與 `.scout/`，進行架構推演與藍圖修訂。
3. **`umbra-reviewer` (審核專家，選用 — 需帶 `--review`)**：負責審查藍圖品質、可行性與指標最優性，必要時自主修復與優化藍圖。
4. **`umbra-coder` (工程師)**：負責接收定案藍圖並投影回專案原始碼，執行測試驗證。

## Workflow Entrypoint & Flags

1. 啟動 `umbra-orchestrator` agent。
2. 把使用者所有的附加 Prompt 與旗標，完整地轉交給首席架構師：
   - `--auto`：跳過藍圖修改後的用戶確認關卡，自動執行投影發派。
   - `--worktree`：修改前先開啟獨立 Git Worktree，並於該 Worktree 目錄下進行所有演進、投影與完成度檢查（嚴禁因主分支未變更而誤判重做）。
   - `--ask`：進行藍圖演進前，先調用 `grilling` 技能進行需求訪談對齊。
   - `--review`：啟用 `@umbra-reviewer` 審查階段（預設為不需要，直接推進至確認或投影）。
   - `--all`：階段一以 Repomix 全量打包讀取 `.blueprint/` + `.scout/`；未加時預設為必讀兩個 README 索引後逐步按需讀取。
   - `--tdd`：啟用 TDD 模式，藍圖審核通過後先調用 `@umbra-tdd-engineer` 編寫紅燈測試，隨後才派發 `@umbra-coder` 將測試轉綠。
3. `umbra-orchestrator` 依據旗標組合完成隔離、訪談、藍圖演進與審核/派發流程。
