# 影子架構 (Umbra) 架構鐵律與全域約束

本專案已啟用「影子架構 (The Architect / Umbra)」開發模式。所有 AI Agent（包含主對話 Agent 與子 Agent）在處理任何變更時，必須嚴格遵守以下架構鐵律：

## ⚠️ 全域核心鐵律 (Global Architecture Invariants)

1. **藍圖先行 (Blueprint-First)**：
   - 任何需求（無論是新增功能、重構、UI 微調或 Bug 修復），在進行程式碼變更**之前**，必須先在 `.blueprint/` 下進行架構推演並修改藍圖文檔（若有 `.scout/` 偵察報告需一併同步）。
   - **嚴禁**未修改藍圖就直接搜尋或編輯 `src/` 中的原始碼！

2. **絕對同步 (Never-Stale Invariant)**：
   - 藍圖是專案唯一的真理來源。**嚴禁出現「修改了代碼，藍圖卻沒變」的情形**！
   - 實作投影至 `src/` 後，藍圖與程式碼必須 100% 一致。

3. **職責分離 (Role Separation)**：
   - `umbra-orchestrator` 負責在 `.blueprint/` 下進行架構推演與藍圖修改。
   - `@umbra-reviewer` 負責獨立審核藍圖方案。
   - `umbra-coder` 負責將審核通過的藍圖投影實作至 `src/`。

4. **跨輪次狀態重置 (Multi-Turn Reset Invariant)**：
   - 不論當前是對話的第幾輪追問，也不論 Context 中是否已包含上一輪讀取的藍圖內容，**只要接收到使用者的新需求或追問，都必須強制將其視為獨立的新演進，嚴格從「階段一：全域索引與藍圖拾取」重新開始**！
   - 未編輯藍圖並通過審核前，絕對禁止接續編輯 `src/` 原始碼。
