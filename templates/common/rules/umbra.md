# 影子架構 (Umbra) 架構鐵律與全域約束

本專案已啟用「影子架構 (The Architect / Umbra)」開發模式。所有 AI Agent（包含主對話 Agent 與子 Agent）在處理任何變更時，必須嚴格遵守以下架構鐵律：

## ⚠️ 全域核心鐵律 (Global Architecture Invariants)

1. **藍圖先行 (Blueprint-First)**：
   - 任何需求（無論是新增功能、重構、UI 微調或 Bug 修復），在進行程式碼變更**之前**，必須先在 `.blueprint/` 下進行架構推演並修改藍圖文檔（若有 `.scout/` 偵察報告需一併同步）。
   - **嚴禁**未修改藍圖就直接搜尋或編輯專案中的真實程式碼！

2. **絕對同步 (Never-Stale Invariant)**：
   - 藍圖是專案唯一的真理來源。**嚴禁出現「修改了代碼，藍圖卻沒變」的情形**！
   - 實作投影至專案程式碼後，藍圖與程式碼必須 100% 一致。

3. **職責分離 (Role Separation)**：
   - `umbra-orchestrator` 專注於全流程編排、旗標處理、雙重同意關卡與使用者溝通橋樑，不直接讀寫藍圖文檔或專案原始碼。
   - `@umbra-architecture` 負責全量/按需閱讀 `.blueprint/` 與 `.scout/`，進行架構推演、藍圖修改、seam 宣告與定案快照匯出。
   - `@umbra-reviewer` 負責（**預設不啟用，僅 `--review` 模式調用**）獨立審核藍圖方案（含目標達成度與效能/指標最優性分析，如避免 N+1、減少 DB/外部調用、優先利用 Redis 等），發現缺陷或更優解時自主修復並升級藍圖。
   - `@umbra-tdd-engineer` 負責（僅 `--tdd` 模式或改善流水線）依宣告 seam 先行撰寫紅燈失敗測試。
   - `@umbra-coder` 負責將定案的藍圖與 TDD 測試投影實作至真實程式碼中。

4. **跨輪次狀態重置 (Multi-Turn Reset Invariant)**：
   - 不論當前是對話的第幾輪追問，也不論 Context 中是否已包含上一輪讀取的藍圖內容，**只要接收到使用者的新需求或追問，都必須強制將其視為獨立的新演進，嚴格從「階段一：全域索引與藍圖拾取」重新開始**！
   - 未編輯藍圖定案前，絕對禁止接續編輯專案原始碼。

5. **使用者同意關卡 (User Approval Gate) 與 旗標擴充**：
   - `umbra-orchestrator` 在 `@umbra-architecture` 修改完藍圖（若帶 `--review` 則含完成審核）後，必須先告訴使用者詳細資訊（藍圖變更、架構影響與預計投影計畫），等使用者同意後才能實施投影等後續。
   - **`--auto`**：跳過使用者同意關卡，自動續行實施投影。
   - **`--worktree`**：任務開始前先建立 Git Worktree，並將該 Worktree 目錄傳遞至所有後續作業。**成果檢查與驗證必須在該 Worktree 目錄中執行**，嚴禁因主分支未變更而誤判未完成並重複重做。
   - **`--ask`**：藍圖推演前調用 `grilling` 技能進行需求訪談對齊。
   - **`--review`**：啟用 `@umbra-reviewer` 藍圖審查階段（預設為不需要 `@umbra-reviewer`，直接由 `@umbra-architecture` 定案）。
   - **`--all`**：階段一強制使用 Repomix 打包 `.blueprint/` 與 `.scout/` 為 `blueprint-context.xml` 全量讀取；未加時預設為：必讀兩個 README 索引後，按需求逐步讀取受影響文檔。
   - **`--tdd`**：TDD 模式。僅當存在 `--tdd` 旗標時，`umbra-orchestrator` 才會調用 TDD 工程師（`umbra-tdd-engineer`）編寫紅燈測試；否則預設直接派發 Coder 進行投影實作。（「improve」系列如 `umbra-improve-orchestrator` 則內建 TDD 流水線）。
   - **`--teamwork`**：團隊協同模式。啟用雙階段 Teamwork 流水線（藍圖領域推演與代碼投影實作均轉為 Batched DAG 批次並行派發、雙階段對抗審查與 HITL 機制；未指定時預設採單流執行以節省 Token）。

6. **藍圖定案與變更包機制 (Blueprint Freeze & Delta Manifest)**：
   - 藍圖的編輯期在架構推演（或 `--review` 審查階段）結束時（Freeze Point）正式關閉。
   - 由最後的定案者（預設為 `@umbra-architecture`；若啟用 `--review` 則為 `@umbra-reviewer`）匯出累計 Diff 快照（`.blueprint/.changes.diff`），並產出結構化「藍圖定案變更包 (Final Blueprint Delta Manifest)」，包含累計異動檔案、接口變更、Do/Do NOT 契約、宣告 Seam 與投影路徑映射。
   - **下游免查 Git 鐵律**：`@umbra-tdd-engineer` 與 `@umbra-coder` 接手時，直接消費 Orchestrator 注入的 Delta Manifest 或查閱 `.blueprint/.changes.diff` 快照，**嚴禁/無需**自行執行 `git status` 或 `git diff`，達成 0 額外指令即刻開工。
