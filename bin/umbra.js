#!/usr/bin/env node
// ponytail: multi-target copy; --opencode (default) | --pi
const fs = require("node:fs");
const path = require("node:path");

const ROOT = path.join(__dirname, "..", "templates");

/** @type {Record<string, { dir: string, done: string, files: { from: string, to: string }[] }>} */
const TARGETS = {
  opencode: {
    dir: ".opencode",
    done: "Restart OpenCode, then /umbra",
    files: [
      { from: "opencode/agents/umbra-orchestrator.md", to: "agents/umbra-orchestrator.md" },
      { from: "opencode/agents/umbra-coder.md", to: "agents/umbra-coder.md" },
      { from: "opencode/commands/umbra.md", to: "commands/umbra.md" },
      { from: "common/skills/umbra", to: "skills/umbra" },
      { from: "common/skills/blueprint-architect", to: "skills/blueprint-architect" },
    ],
  },
  pi: {
    dir: ".pi",
    done: "Restart Pi, then /umbra or run agent umbra-orchestrator",
    files: [
      { from: "pi/agents/umbra-orchestrator.md", to: "agents/umbra-orchestrator.md" },
      { from: "pi/agents/umbra-coder.md", to: "agents/umbra-coder.md" },
      { from: "pi/prompts/umbra.md", to: "prompts/umbra.md" },
      { from: "common/skills/umbra", to: "skills/umbra" },
      { from: "common/skills/blueprint-architect", to: "skills/blueprint-architect" },
    ],
  },
};

function usage() {
  console.log(`umbra — install Umbra into a project agent dir

Usage:
  umbra init [--opencode|--pi]     Copy templates (default: --opencode)
  umbra update [--opencode|--pi]   Overwrite managed files
  umbra uninstall [--opencode|--pi] Remove managed files only

Flags (pick one; default opencode):
  --opencode   → .opencode/  (commands/, OpenCode frontmatter)
  --pi         → .pi/        (prompts/, Pi frontmatter + subagent)

Install:
  npm i -g git+https://github.com/YOU/umbra.git
  npx --yes github:YOU/umbra init --pi
`);
}

function parseArgs(argv) {
  const flags = argv.filter((a) => a.startsWith("--"));
  const cmd = argv.find((a) => !a.startsWith("--")) || "help";
  let target = "opencode";
  for (const f of flags) {
    const name = f.slice(2);
    if (TARGETS[name]) target = name;
    else if (name === "help" || name === "h") return { cmd: "help", target };
    else {
      console.error(`unknown flag: ${f} (want --${Object.keys(TARGETS).join(" | --")})`);
      process.exit(1);
    }
  }
  return { cmd, target };
}

function cp(src, dst, replace) {
  const st = fs.statSync(src);
  if (st.isDirectory()) {
    fs.mkdirSync(dst, { recursive: true });
    for (const name of fs.readdirSync(src)) {
      if (name === "__pycache__" || name === ".DS_Store") continue;
      cp(path.join(src, name), path.join(dst, name), replace);
    }
    return;
  }
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  let body = fs.readFileSync(src);
  if (replace && /\.(md|py|txt|json)$/i.test(src)) {
    let t = body.toString("utf8");
    for (const [k, v] of Object.entries(replace)) t = t.split(k).join(v);
    body = Buffer.from(t, "utf8");
  }
  fs.writeFileSync(dst, body);
}

function rm(p) {
  if (!fs.existsSync(p)) return;
  fs.rmSync(p, { recursive: true, force: true });
}

function install(cwd, targetName) {
  const t = TARGETS[targetName];
  const destRoot = path.join(cwd, t.dir);
  const replace = { __UMBRA_ROOT__: t.dir };
  for (const { from, to } of t.files) {
    const src = path.join(ROOT, from);
    const dst = path.join(destRoot, to);
    if (!fs.existsSync(src)) {
      console.warn(`skip missing template: ${from}`);
      continue;
    }
    rm(dst);
    cp(src, dst, replace);
    console.log(`+ ${t.dir}/${to.replace(/\\/g, "/")}`);
  }
  console.log(`\nDone (${targetName}). ${t.done}`);
}

function uninstall(cwd, targetName) {
  const t = TARGETS[targetName];
  const destRoot = path.join(cwd, t.dir);
  for (const { to } of t.files) {
    const dst = path.join(destRoot, to);
    if (!fs.existsSync(dst)) continue;
    rm(dst);
    console.log(`- ${t.dir}/${to.replace(/\\/g, "/")}`);
  }
}

const { cmd, target } = parseArgs(process.argv.slice(2));
const cwd = process.cwd();

if (cmd === "init" || cmd === "update") install(cwd, target);
else if (cmd === "uninstall") uninstall(cwd, target);
else usage();
