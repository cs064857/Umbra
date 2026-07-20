# AGENTS.md — umbra

Git-installable CLI that **copies** Umbra agents/skills into a consumer project. Not an app; no build, test, lint, or deps.

## Layout (source of truth)

| Path | Role |
|------|------|
| `bin/umbra.js` | Entire CLI. `TARGETS` whitelist = what `init`/`update`/`uninstall` touch. |
| `templates/common/` | Shared skills. Copied for every target. |
| `templates/opencode/` | OpenCode-only agents + `commands/` |
| `templates/pi/` | Pi-only agents + entry files |
| `package.json` `files` | Only `bin` + `templates` ship. |

Anything under `templates/` **not** listed in `TARGETS[target].files` is **not** installed (e.g. extra umbra-blueprint agents may exist on disk but stay out of consumer projects until added to `TARGETS`).

## Commands

```bash
node bin/umbra.js init              # default --opencode → .opencode/
node bin/umbra.js init --pi         # → .pi/
node bin/umbra.js update [--opencode|--pi]   # same as init (overwrite)
node bin/umbra.js uninstall [--opencode|--pi]
# after npm i -g <this-repo>: umbra …
```

- `init` === `update`. No merge; managed paths are deleted then recopied.
- Flag must be a key of `TARGETS` (`--opencode` | `--pi`). Unknown flag exits 1.
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
