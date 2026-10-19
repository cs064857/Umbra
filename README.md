# Umbra

Install Umbra into a project's agent dir via **git** (no npm publish).

## Install CLI

```bash
npm i -g git+https://github.com/YOU/umbra.git
# one-shot
npx --yes github:YOU/umbra init
npx --yes github:YOU/umbra init --pi
```

## Per project

```bash
cd your-repo
umbra init              # default → .opencode/ (auto-registers in ~/.umbra/projects.json)
umbra init --opencode   # same
umbra init --pi         # → .pi/ (Pi Coding Agent)
umbra update --pi       # overwrite managed files for that target
umbra uninstall --pi    # remove only umbra-managed files & unregister
```

## Multi-project one-click update

Every `umbra init` / `umbra update` records the project path, target, and `-e` setting in `~/.umbra/projects.json`.

```bash
umbra list                                  # view all registered projects
umbra scan G:\MyProgram                     # auto-discover pre-existing Umbra projects under a folder
umbra update --all                          # one-click update ALL registered projects
umbra update --all --scan G:\MyProgram      # discover + update all in one step
```

| Flag | Dest | Agents | Entry |
|------|------|--------|-------|
| `--opencode` (default) | `.opencode/` | OpenCode frontmatter + `task` | `commands/` |
| `--pi` | `.pi/` | Pi frontmatter + `subagent` | `prompts/` |

Skills are shared; install rewrites `__UMBRA_ROOT__` → `.opencode` or `.pi`.

## What gets written

**OpenCode**

```
.opencode/
  agents/umbra-{orchestrator,coder}.md
  commands/umbra.md
  skills/{umbra,umbra-blueprint-architect}/
```

**Pi**

```
.pi/
  agents/umbra-{orchestrator,coder}.md
  prompts/umbra.md
  skills/{umbra,umbra-blueprint-architect}/
```

## Local dev

```bash
npm i -g G:\MyProgram\ClaudeCodeProject\umbra
cd some-project && umbra init --pi
```
