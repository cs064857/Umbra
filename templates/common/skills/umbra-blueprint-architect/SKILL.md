---
name: umbra-blueprint-architect
description: Defines the standard structure and rules for creating high-density umbra architecture blueprints (.blueprint directory). Use this skill when generating blueprints or designing architecture.
---

# Blueprint Architect

## Overview

This skill defines the format and philosophy of the "Umbra / 影子架構" pattern. In larger projects, AI agents often struggle because source code provides too low-density information (high noise). Instead of relying on source code to convey intent, we maintain a `.blueprint/` directory that mirrors the project structure but contains pure, concentrated engineering intent.

When generating these blueprint files, you must strictly follow the format below.

## 核心分析原則 (Source-Code-Only & Noise Reduction Policy)

1. **只閱讀真實程式碼 (Source Code Only)**：
   - 藍圖的建置與沙盤推演**必須完全建立在實際程式碼 (Source Code)** 上（如 `.py`、`.ts`、`.java`、`.vue` 等）。
   - **嚴禁閱讀專案中既存的 Markdown (.md) 檔案（`AGENTS.md` 除外）**。切勿載入或採納既存的 `README.md` 或其他說明文檔，防範過時、錯誤或幻覺資訊干擾藍圖生成。
2. **主動排除非程式碼與 IDE / 工具 / 暫存檔案**：
   - 主動忽視並排除所有與實體程式碼無關的目錄與檔案，例如：隱藏資料夾（`.serena`、`.vscode`、`.idea`、`.claudecode`、`.opencode`、`.pi`、`.agents`、`.gemini`、`.git` 等）、暫存與構建目錄（`temp`、`tmp`、`.temp`、`.tmp`、`node_modules`、`dist`、`build`、`venv`、`__pycache__` 等）。
3. **嚴格遵循無視規則 (.gitignore & .blueprintignore)**：
   - 務必自動套用並嚴格遵守專案中的 `.gitignore` 與 `.blueprintignore` 無視清單，不得為被忽略的檔案生成藍圖。

## 四大生產重構成熟規範 (Production-Grade Architecture Standards)

為確保藍圖管線工程成熟、安全嚴密、跨平台相容，所有 Blueprint 相關 Agent、腳本與流程必須嚴格遵守以下四項成熟規範：

### 1. 檔案路徑格式：100% 乾淨相對路徑 (Pure Relative Paths)
- **零環境污染**：所有在 `bundles.json`、`README.md`、CLI 命令、任務派發 prompt 及藍圖報告中的檔案路徑，**必須 100% 採用相對於專案根目錄的乾淨相對路徑**（例如：`src/user/UserService.java`，對應藍圖 `.blueprint/src/user/UserService.java.md`）。
- **嚴禁本機絕對路徑**：絕對禁止包含磁碟代號（如 `C:/`、`D:/`）或本機使用者路徑（如 `/Users/...`、`/home/...`）。藍圖產物必須可在任意機器、容器或 CI/CD 環境中無縫攜帶與驗證。

### 2. 檔名與代碼衛生：規範的雙副檔名，無重複 (Standard Dual-Extensions & Hygiene)
- **規範的雙副檔名**：所有原始碼對應的藍圖檔名，必須嚴格保留原始完整檔名與副檔名，並追加 `.md`：
  - 格式：`<原相對路徑與原副檔名>.md`
  - 範例：`src/app.ts` ➡️ `.blueprint/src/app.ts.md`；`src/views/Home.vue` ➡️ `.blueprint/src/views/Home.vue.md`；`service/main.py` ➡️ `.blueprint/service/main.py.md`。
- **嚴禁單副檔名截斷**：絕對禁止將副檔名截斷為 `.md`（如 `app.md`、`Home.md`）。
- **代碼衛生與清理衝突**：嚴格防禦目錄污染。同一目錄下**嚴禁同時殘留 `.md` 與 `.ts.md` 雙重檔案**。若檢測到歷史舊版截斷的孤兒 `.md` 檔案，必須自動偵測並清理刪除，杜絕重複與髒資料。

### 3. Bundle 規劃：高內聚領域 Bundle，層次分明 (Domain-Driven High-Cohesion Bundles)
- **拒絕碎片化**：嚴禁將專案隨意切分成 50+ 個僅有 1~2 個檔案的微型碎片 Bundle；嚴禁使用 `bundle_1`、`bundle_2` 等無意義純數字黑盒編號。
- **領域高內聚聚合**：依據業務領域、核心架構子系統或功能邊界聚合檔案（例如將同一個領域的 Controller、Service、Repository、Model、Types/Utils 歸納於同一個 Bundle），使 Worker 能夠在一個上下文內通盤掌握模組的完整依賴拓撲。
- **架構層次標準**：中大型專案應收斂劃分為層次分明的高內聚領域 Bundle（典型成熟專案約收斂為 10~25 個領域 Bundle，如成熟版 19 個高內聚領域 Bundle）。
- **語意化命名**：所有 Bundle ID 必須具備明確的語意架構標籤（如 `auth-identity`, `billing-engine`, `data-pipeline`, `infra-persistence`, `ui-dashboard`）。

### 4. 跨平台路徑防禦：強制 POSIX 正斜線 `/` 標準化 (POSIX Path Normalization)
- **全路徑正規化**：無論執行環境為 Windows、macOS 或 Linux，所有檔案路徑在解析、比較、寫入 JSON（`bundles.json`）及 Markdown（`README.md`）之前，**必須強制標準化為 POSIX 正斜線 `/`**（將所有 `\` 替換為 `/`）。
- **避免逸出字元陷阱**：杜絕 Windows 反斜線 `\` 進入 JSON 字串或造成 Git/跨平台解析失敗。

## Format Guidelines

Each Blueprint markdown file MUST contain the following three sections. Do not include verbose pseudo-code or the actual implementation code. **Always output in Traditional Chinese (繁體中文).**

### 1. 職責契約

Use natural language to strictly define what this module "does" and what it "does not do".
**Example:**
"該模塊僅負責用戶數據的持久化存儲。它**嚴禁**包含任何關於用戶權限驗證的業務邏輯（那是 `AuthService` 的職責）。"

### 2. 接口摘要

List the Public methods, focusing solely on the **shape of input/output data** and any **side effects**.
**Example:**
`createUser(UserDto userDto)`:

- **Input**: `UserDto` (必須包含 email)
- **Side Effect**: 寫入 `users` 表；觸發 `USER_CREATED` 事件。
- **Constraints**: 必須在 `@Transactional` 中執行。

### 3. 依賴拓撲

Describe its position in the data flow or architecture. You may use simple text arrows or Mermaid charts.
**Example:**
Controller -> **UserService** -> UserRepository

## Scout 與 Blueprint 連動與同步規範 (Scout & Blueprint Co-evolution Policy)

 - **連動前提**：當專案目錄下存在 `.scout/` 資料夾（表示已進行過 codebase 偵察）時。
 - **強制執行規則**：
   1. **協同閱讀**：在閱讀 `.blueprint/` 目錄中的架構藍圖時，AI **必須**一併讀取並載入 `.scout/` 中的偵察文檔，將「工程意圖（藍圖）」與「程式碼偵察狀態（Scout）」結合理解。
   2. **雙向同步修改**：在演進或修改 `.blueprint/` 下的設計藍圖時，若該變更影響到了實體程式碼的結構或狀態，**必須**一併同步修改或更新 `.scout/` 中對應的偵察文檔，確保設計意圖與偵察現狀保持平行同步，防範資訊斷層。
