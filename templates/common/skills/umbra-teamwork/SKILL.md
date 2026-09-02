---
name: umbra-teamwork
description: Umbra 影子架構之雙階段團隊協同 (Teamwork) 執行規範。涵蓋「藍圖架構推演」與「代碼投影實作」的 Batched DAG 批次並行、物理 Context 隔離、雙階段對抗審查與 HITL 人機協同暫停機制。
---

# Umbra Teamwork 雙階段團隊協同規範

本技能為 Umbra 影子架構在啟用 `--teamwork` 旗標時的標準作業規範。
透過**「藍圖推演 Teamwork」**與**「代碼投影 Teamwork」**的雙層流水線，解決大型/跨領域任務下的 Context 膨脹、單線速度瓶頸與架構走樣問題。

---

## 核心設計準則

1. **藍圖唯一真理 (Blueprint Invariant)**：
   無論並行推演或並行實作，`.blueprint/` 始終是唯一真理來源與交接契約。
2. **物理脈絡隔離 (Physical Context Isolation)**：
   每個 Worker / Sub-Architect 均在獨立的子 Session 中作業，僅讀取與修改被指派的 Bundle 檔案，中間推理雜訊不回流至主 Orchestrator。
3. **批次依賴排程 (Batched DAG Engine)**：
   將任務依賴關係拓撲排序為循序批次（Batch 0, Batch 1...）。同批次內無相互依賴之任務**完全並行派發**。
4. **雙階段對抗審查 (Two-Stage Review Gate)**：
   產物提交後必須通過獨立審查員把關，防範 Scope Creep 與代碼缺陷。
5. **人機協同強制暫停 (HITL Protocol)**：
   單一節點連續審查失敗 3 次或遭遇不可調和之衝突時，停用工具並輸出純文字決策選單等待人類確認。

---

## 第一階段：藍圖架構推演 Teamwork (Blueprint Architecture Teamwork)

當任務涉及多個業務領域或大型系統重構時，藍圖推演採用以下協同流程：

### 1. 領域影響面拆解 (Domain Decomposition)
- 由 `@umbra-blueprint-analyzer` 先行檢視需求與全域索引 (`.blueprint/README.md`)。
- 將需求拆解為互相獨立或具依賴階層的**藍圖領域組 (Domain Bundles)**，例如：
  - **Batch 0 (核心/獨立領域)**：資料模型藍圖、基礎認證協定藍圖。
  - **Batch 1 (依賴領域)**：業務服務藍圖、支付結算藍圖（依賴 Batch 0 宣告之 Seam）。
  - **Batch 2 (閘道/展示領域)**：API 路由藍圖、前端 UI 藍圖（依賴 Batch 1 宣告之 Seam）。

### 2. 批次並行藍圖推演 (Parallel Sub-Architects)
- 對於同一個 Batch 的所有領域，Orchestrator 使用 `task` 工具**同時並行派發** `@umbra-architecture`。
- 每個 Sub-Architect 僅在指派的藍圖領域目錄內作業，推演架構、更新藍圖並明確宣告接口 Seam（方法簽名、出入參數、職責契約 Do/Do NOT 與依賴拓撲）。

### 3. 全域架構對抗審查 (Cross-Domain Review Gate)
- 所有領域藍圖完成後，統一交由 `@umbra-reviewer` 進行全域審查：
  - **閉環驗證**：檢查跨領域 Seam 調用是否皆有對應宣告，無黑盒懸空依賴。
  - **指標最優性**：審核是否具備 N+1 查詢防護、快取利用最優化、資料庫連接減量等。
  - 審查通過後，藍圖正式定稿並向使用者匯報（User Approval Gate）。

---

## 第二階段：代碼投影實作 Teamwork (Code Projection Teamwork)

使用者在同意關卡確認藍圖與投影計畫後，進入代碼投影流水線：

### 1. 藍圖 Seams 轉化為 Task DAG
- 讀取定稿藍圖中的所有變更檔案與 Seam 清單。
- 將專案原始碼檔案依照模組邊界劃分為 **Bundle（每組 2~5 個檔案）** 並排程為代碼實作批次：
  - **Batch 0**：Schema、DTO、型別定義、通用 Utils。
  - **Batch 1**：核心 Domain 模組、Service 實作。
  - **Batch 2**：Controller、API 接口、UI 視圖組件。

### 2. 批次並行派發 (Parallel Worker Dispatch)
- 對於當前批次內的所有就緒任務，使用 `task` 工具**同時並行調用** `@teamwork-worker`（或 `@umbra-coder`）。
- **派發 Prompt 必須明確限制**：
  1. 任務唯一 ID 與目標描述。
  2. 授權編輯的 `bundleFiles` 與 `outputFiles`（嚴禁越界修改未授權檔案）。
  3. 對應的 `.blueprint/**/*.md` 藍圖內容片段作為唯一的實作真理來源。
  4. Worktree 絕對路徑（若啟用 `--worktree` 旗標）。
- **TDD 聯動（若啟用 `--tdd` 旗標）**：
  - 先由測試工程師針對 Seam 撰寫失敗的紅燈測試，Worker 負責將測試轉綠。

### 3. 雙階段對抗性審查閘道 (Two-Stage Review Gate)
Worker 完成代碼與自測後提交產物清單，依序通過兩位獨立審查員：
- **Stage 1 (規格審查員 `@teamwork-spec-reviewer`)**：
  - 比對代碼實作是否 100% 符合 `.blueprint` 規範。
  - 嚴查是否有未在藍圖宣告的私自擴充（Scope Creep）或遺漏邏輯。
- **Stage 2 (品質審查員 `@teamwork-quality-reviewer`)**：
  - 審查型別安全、邊界條件處理、SOLID/DRY 原則。
  - 驗證單元測試是否真實通過。

### 4. 審查路由與防死循環機制
- **審查通過**：節點標記為 COMPLETED。當前批次所有節點皆通過後，自動解鎖推進至下一批次。
- **審查未過 (重試 < 3 次)**：附帶具體審查缺陷反饋（Review Findings），退回對應 Worker 重新修復。
- **觸發 HITL (重試 >= 3 次)**：
  - 立即暫停流水線，停止所有工具呼叫。
  - 輸出 Markdown 格式之人工介入決策報告（包含衝突檔案、重試歷史與建議選項），等待人類指示後恢復。

---

## 第三階段：全域整合總裝與交付 (Synthesis & Finalization)

1. **全域整合驗證**：
   所有批次完成後，於 Worktree 或專案根目錄執行整體編譯與測試套件，確保模組整合零錯誤。
2. **絕對同步校驗 (Never-Stale Invariant)**：
   核對專案原始碼與 `.blueprint/` 文檔，若實作期間有細微參數調整，必須同步回寫藍圖，確保 100% 一致。
3. **交付成果回報**：
   向使用者彙整輸出各批次執行歷程、審查結果與最終驗證日誌。
