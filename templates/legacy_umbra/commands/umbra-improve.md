---
description: 觸發「影子架構改善 (Umbra Improve)」工作流：分析深化機會 → 藍圖演進 → TDD → 投影優化 → 兩軸審查。支援 --scope、--auto、--worktree、--ask、--direct、--all 旗標。
agent: umbra-improve-orchestrator
dependencies:
  - agents/umbra-improve-analyzer
  - agents/umbra-reviewer
  - agents/umbra-tdd-engineer
  - agents/umbra-coder
  - agents/umbra-code-reviewer
---

# 🪄 Command: /umbra-improve

`/umbra-improve` 用於**改善既有架構**：在「藍圖先行、絕對同步」鐵律下，由分析師找出模組深化（Deepening）候選，使用者挑選後走 藍圖演進 → 審核 → TDD 紅燈 → 投影轉綠 → 雙軸審查 的完整流水線。

與 `/umbra` 的分工：有明確需求/新功能用 `/umbra`；要「找架構問題、改善、重構」用 `/umbra-improve`。

## Workflow Entrypoint & Flags

1. 啟動 `umbra-improve-orchestrator` agent。
2. 把使用者所有附加 Prompt 與旗標完整轉交給首席改善架構師：
   - `--scope <路徑>`：限定分析範圍；未加時由 Analyzer 依 git 熱點定界。
   - `--auto`：僅跳過「投影前批准」關卡；**分析後的候選選擇永遠由使用者決定**。
   - `--worktree`：修改前先建立獨立 Git Worktree，所有演進、TDD、投影、驗證皆在該目錄內進行。
   - `--ask`：選定候選後調用 `grilling` 技能做深度質詢對齊。
   - `--direct`：跳過 `@umbra-reviewer` 藍圖審查階段。
   - `--all`：階段一以 Repomix 全量打包讀取 `.blueprint/` + `.scout/`；未加時預設必讀兩個 README 索引後逐步按需讀取。
3. `umbra-improve-orchestrator` 依旗標組合完成：隔離 → 藍圖拾取 → 分析報告 → 候選選擇 → 藍圖演進 → 審核/批准 → TDD 紅燈 → 投影轉綠 → 雙軸審查 → 回報。
