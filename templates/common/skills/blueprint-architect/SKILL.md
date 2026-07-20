---
name: blueprint-architect
description: Defines the standard structure and rules for creating high-density umbra architecture blueprints (.blueprint directory). Use this skill when generating blueprints or designing architecture.
---

# Blueprint Architect

## Overview

This skill defines the format and philosophy of the "Umbra / 影子架構 (影子架構)" pattern. In larger projects, AI agents often struggle because source code provides too low-density information (high noise). Instead of relying on source code to convey intent, we maintain a `.blueprint/` directory that mirrors the project structure but contains pure, concentrated engineering intent.

When generating these blueprint files, you must strictly follow the format below.

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
