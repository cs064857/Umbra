---
name: umbra
description: 影子架構 (Umbra) 工作流核心技能。將「工程意圖」與「代碼實現」物理分離，AI 必須先在 .blueprint/ 目錄下完成架構推演，再以投影 (Projection) 方式同步至 src/。當使用者提及影子架構、藍圖驅動開發、意圖驅動修改、架構演進、或使用 /umbra 指令時，務必載入此技能。
---

# Umbra — 影子架構工作流

本技能定義了一套「顛倒真理來源 (Inverting the Source of Truth)」的編程範式。

**核心理念**：`.blueprint/` 目錄下的藍圖文檔才是描述專案全貌的唯一真理，專案中的原始碼只是藍圖的「實現投影」。

## ⚠️ 黃金鐵律：藍圖絕對同步 (Never-Stale Blueprint Rule)

1. **修改前後必須修改藍圖**：執行任何程式碼變更**之前**，必須先在 `.blueprint/` 中更新意圖與架構設計；程式碼完成**之後**，必須確保藍圖反應最終狀態。
2. **嚴禁「改了代碼、藍圖未變」**：切勿修改專案中的真實程式碼卻讓 `.blueprint/` 藍圖保持未變！藍圖與代碼必須隨時維持 100% 一致。

## 🚩 支援旗標說明

在呼叫 `/umbra` 或調用 `umbra-orchestrator` 時可搭配以下旗標：
- `--auto`：自動續行派發投影，跳過藍圖修改後的使用者同意關卡。
- `--worktree`：於任務開始前開啟獨立 Git Worktree，避免影響主分支 (`master`/`main`)。必須記錄該 Worktree 目錄絕對路徑，後續所有投影實作與成果檢查**均必須在此 Worktree 目錄內進行**，嚴禁因主分支未變更而誤判為未完成並盲目重做。
- `--ask`：在藍圖推演前先調用 `grilling` 技能進行需求質詢與訪談對齊。
- `--direct`：跳過 `@umbra-reviewer` 藍圖審查階段，直接推進至確認或投影。
- `--all`：強制使用 Repomix 將 `.blueprint/` 與 `.scout/` 打包為 `blueprint-context.xml` 並一次性全量讀取；未加此旗標時預設逐步按需讀取（大專案建議預設以省 context）。
- `--tdd`：TDD 模式。僅當此旗標存在時，`umbra-orchestrator` / `test-umbra-orchestrator` 才會調用 TDD 工程師編寫紅燈測試；否則直接進行投影實作。

## 思考三階段（線性流程，不可跳過）

當你接收到使用者的需求（不論是新增功能、重構或修 Bug），你**必須且只能**遵循以下的思考三階段。禁止跳過任何階段直接寫程式。

### 階段一：全域索引與藍圖拾取 (Blueprint Indexing)

**目的**：精確理解本次需求「在架構上屬於哪裡」。

1. **必讀全域索引 README**：不論是否使用 `--all`，**必讀** `.blueprint/README.md` 與 `.scout/README.md`，先建立全域地圖、依賴拓撲與文檔索引。
2. **依旗標選擇載入策略**：
   - **（預設）逐步按需讀取**：根據 README 索引與需求關鍵字，僅逐步讀取本次受影響範圍的 `.blueprint/` 與 `.scout/` 文檔（可搭配 `glob`/`grep` 輔助定位），避免一次性載入整個知識庫造成 context 超載。
   - **（`--all` 旗標）Repomix 全量讀取**：利用 `repomix` 建立/更新 `blueprint-context.xml`（經由專案根目錄下的 `repomix.config.json` 打包 `.blueprint/` 與 `.scout/`），並全量讀取 `blueprint-context.xml` 一次性載入藍圖與偵察 context。

**禁忌**：

- 嚴禁去專案中尋找真實程式碼檔案或直接開始修改。
- 嚴禁跳過索引直接動手。

### 階段二：架構演進 (Architecture Evolution)

**目的**：顧全大局地進行「沙盤推演」，在修改代碼前，先在文檔層面把設計敲定。

1. **職責審視**：檢查使用者提出的新增邏輯，是否違反了被讀取藍圖中的「職責契約」。如果不該放這裡，你必須找出應該放的地方。
2. **接口與依賴變更**：確定接口是否需要增加傳入參數？副作用改變了嗎？對其他模組的依賴拓撲是否要修改？
3. **更新藍圖**：使用編輯工具**直接修改** `.blueprint/` 對應的 Markdown 檔案。
4. **新模組**：如果是全新的檔案，使用 scaffold 腳本建立標準藍圖模板：
   `python .opencode/skills/umbra/scripts/scaffold.py <新檔案路徑>`
 5. **驗證拓撲**：執行 visualize 腳本取得最新的全域 Mermaid 拓撲圖：
    `python .opencode/skills/umbra/scripts/visualize.py`

**禁忌**：

- 依然嚴禁修改任何專案中的真實程式碼。

### 階段三：投影同步 (Projection)

**目的**：將階段二做出的「意圖」改動，轉化為「可執行代碼」。

1. **對應實作**：前往專案真實原始碼檔案（或有啟動 Worktree 則為該 Worktree 目錄下），找到這些藍圖所指向的源代碼檔案。
2. **精準投影 (Projection)**：
   - 根據藍圖中的「接口摘要」去新增或修改方法簽名與出入參數。
   - 根據藍圖中的「職責契約」(Do/Do NOT) 去實作邏輯。
   - **絕對嚴禁**在實作中引入藍圖「依賴拓撲」中未記載的其他模組引用。
3. **中斷回報機制**：如果你在寫 Code 的過程中發現：「這個邏輯一定要依賴某個未在藍圖中記載的模組才能跑通」。**立刻停止修改程式碼**。這代表「藍圖的設計不合理，需要修改依賴拓撲」。請重新回到階段二修改 `.blueprint/` 對應的藍圖，然後再回頭執行投影。

## 藍圖文件標準格式

每個 `.blueprint/*.md` 檔案包含三大區塊：

1. **職責契約 (Responsibility Contract)** — Do / Do NOT
2. **接口摘要 (Interface Summary)** — 輸入、輸出、約束條件
3. **依賴拓撲 (Dependency Topology)** — 入向/出向依賴 + Mermaid 圖

> 在 AI 時代，人類程序員只在乎系統的形狀是否優雅。程式碼只是藍圖的影子。
