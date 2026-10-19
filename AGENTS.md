# AGENTS.md — umbra

Git-installable CLI that **copies** Umbra agents/skills into a consumer project. Not an app; no build, test, lint, or deps.

## Layout (source of truth)

| Path | Role |
|------|------|
| `bin/umbra.js` | Entire CLI. Dynamically scans `templates/` categories for `init`/`update`/`uninstall`. |
| `templates/common/` | Shared skills (`common/skills/`) and rules (`common/rules/`). Copied for every target. |
| `templates/opencode/` | OpenCode-only `agents/`, `commands/`, and `prompts/`. |
| `templates/pi/` | Pi-only `agents/`, `commands/`, and `prompts/`. |
| `package.json` `files` | Only `bin` + `templates` ship. |

All files and subdirectories placed under `templates/common/skills/` and `templates/<target>/` (`agents/`, `commands/`, `prompts/`) are automatically scanned and copied during `init`/`update` without needing to modify `bin/umbra.js`.

## Commands

```bash
node bin/umbra.js init                      # default --opencode → .opencode/ (registers in ~/.umbra/projects.json)
node bin/umbra.js init --pi                 # → .pi/
node bin/umbra.js init -e                   # local ignore → add to .git/info/exclude
node bin/umbra.js update [--opencode|--pi] [-e]   # same as init (overwrite current project)
node bin/umbra.js update --all              # one-click update all registered projects
node bin/umbra.js update --all --scan <dir> # auto-discover existing projects under <dir> & update all
node bin/umbra.js scan [dir]                # scan & register existing Umbra projects into ~/.umbra/projects.json
node bin/umbra.js list                      # list all registered projects
node bin/umbra.js uninstall [--opencode|--pi]
# after npm i -g <this-repo>: umbra …
```

- `init` === `update`. No merge; managed paths are deleted then recopied. Automatically registers the project in `~/.umbra/projects.json`.
- `update --all` (`-a`) iterates through all registered projects in `~/.umbra/projects.json`, preserving each project's `target` and `exclude` configuration. Combine with `--scan [dir]` (`-s`) to auto-discover legacy projects first.
- Target flag must be a key of `TARGETS` (`--opencode` | `--pi`). Optional `-e` / `--exclude` adds managed paths to `.git/info/exclude`. Unknown flag exits 1.
- Verify: run init in a temp cwd, check printed `+ <dir>/…` lines and that `__UMBRA_ROOT__` is gone from installed files.

## Gotchas agents miss

1. **`TARGETS.from` must exist** — missing source → `skip missing template` (silent partial install). Keep `from` paths in sync with real files under `templates/`.
2. **`__UMBRA_ROOT__` placeholder** — required in templates for project-relative skill/script paths. Install rewrites it to `.opencode` or `.pi`. Only `.md` / `.py` / `.txt` / `.json`. Do **not** hardcode `~/.config/opencode/...` or a single target dir in `common/`.
3. **Target format differs** — OpenCode: `commands/`, frontmatter `permission` + `task` tool. Pi: prefer `prompts/` (see `TARGETS.pi`), frontmatter `name`/`tools` + `subagent` tool. Do not copy OpenCode agent frontmatter into `templates/pi/` unchanged.
4. **Skills are shared** — edit once under `templates/common/skills/`; both targets get the same tree (after placeholder rewrite).
5. **Consumer workflow is separate** — installed skills teach `.blueprint/` → project `src/` projection. This repo does not contain consumer blueprints or app code.
6. **No toolchain** — Node ≥18, stdlib only. No `npm test` / build step. Smoke = run CLI + inspect output tree.

## Adding a target

1. Add `TARGETS.<name>` with `dir`, `done`, and `files[]` (`from` relative to `templates/`, `to` relative to `dir`).
2. Add `templates/<name>/…` sources those `from` paths.
3. Extend usage string / README flags to match.

## Supermemory

- **Container Tag**：`Umbra`（本專案長期記憶的 containerTag，搜尋/寫入時使用此 tag）
