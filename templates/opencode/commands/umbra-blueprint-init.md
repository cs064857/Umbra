---
description: 初始化當前專案的影子架構（Umbra / 影子架構），依據生產重構成熟版標準（100% 乾淨相對路徑、規範雙副檔名、高內聚領域 Bundle 與 POSIX 標準化）掃描專案並建立 .blueprint 藍圖目錄。
agent: umbra-blueprint-orchestrator
subtask: true
---

# Blueprint Initialization

請依據「生產重構成熟版標準」初始化當前專案的影子架構：
1. **100% 乾淨相對路徑**：全流程杜絕本機絕對路徑與環境污染。
2. **規範雙副檔名與代碼衛生**：建立 `<file>.<ext>.md` 藍圖，自動偵測並清理舊版截斷 `.md` 檔案，杜絕雙重檔案污染。
3. **高內聚領域 Bundle 規劃**：依架構與業務邊界收斂劃分為層次分明、語意化命名的高內聚領域 Bundle（拒絕碎片化）。
4. **跨平台路徑防禦**：強制使用 POSIX 正斜線 `/` 標準化。

無需額外的 Prompt 輸入。
