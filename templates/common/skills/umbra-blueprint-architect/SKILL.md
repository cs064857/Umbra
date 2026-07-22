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
