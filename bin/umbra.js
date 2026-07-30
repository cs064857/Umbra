#!/usr/bin/env node
// ponytail: multi-target copy; --opencode (default) | --pi
const fs = require("node:fs");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..", "templates");

/** @type {Record<string, { dir: string, done: string, categories: { from: string, to: string }[] }>} */
const TARGETS = {
  opencode: {
    dir: ".opencode",
    done: "Restart OpenCode, then /umbra",
    categories: [
      { from: "common/skills", to: "skills" },
      { from: "common/rules", to: "rules" },
      { from: "opencode/agents", to: "agents" },
      { from: "opencode/commands", to: "commands" },
      { from: "opencode/prompts", to: "prompts" },
    ],
  },
  pi: {
    dir: ".pi",
    done: "Restart Pi, then /umbra or run agent umbra-orchestrator",
    categories: [
      { from: "common/skills", to: "skills" },
      { from: "common/rules", to: "rules" },
      { from: "pi/agents", to: "agents" },
      { from: "pi/commands", to: "commands" },
      { from: "pi/prompts", to: "prompts" },
    ],
  },
};

function getFilesForTarget(targetName) {
  const t = TARGETS[targetName];
  if (!t) return [];
  const files = [];

  for (const { from, to } of t.categories) {
    const srcDir = path.join(ROOT, from);
    if (!fs.existsSync(srcDir)) continue;

    const entries = fs.readdirSync(srcDir);
    for (const entry of entries) {
      if (entry === "__pycache__" || entry === ".DS_Store") continue;
      files.push({
        from: `${from}/${entry}`,
        to: `${to}/${entry}`,
      });
    }
  }

  return files;
}

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

function ensureRepomixConfig(cwd) {
  const configPath = path.join(cwd, "repomix.config.json");
  if (!fs.existsSync(configPath)) {
    const content = JSON.stringify(
      {
        output: {
          filePath: "blueprint-context.xml",
          style: "xml",
        },
        include: [
          ".blueprint/**/*",
          ".scout/**/*",
        ],
        ignore: {
          useDefaultPatterns: false,
        },
      },
      null,
      2
    ) + "\n";
    fs.writeFileSync(configPath, content, "utf8");
    console.log("+ repomix.config.json");
  }
}

function ensureRepomixInstalled() {
  let hasRepomix = false;
  try {
    execSync("repomix --version", { stdio: "ignore" });
    hasRepomix = true;
  } catch (e) {
    hasRepomix = false;
  }

  if (!hasRepomix) {
    console.log("repomix not found. Installing globally via npm install -g repomix...");
    try {
      execSync("npm install -g repomix", { stdio: "inherit" });
      console.log("+ repomix (globally installed)");
    } catch (err) {
      console.warn("Failed to automatically install repomix globally. Please run 'npm install -g repomix' manually.");
    }
  }
}

function ensureGitIgnore(cwd) {
  const gitignorePath = path.join(cwd, ".gitignore");
  if (fs.existsSync(gitignorePath)) {
    const content = fs.readFileSync(gitignorePath, "utf8");
    const target = "blueprint-context.xml";
    if (!content.includes(target)) {
      const newLine = content.endsWith("\n") ? target + "\n" : "\n" + target + "\n";
      fs.appendFileSync(gitignorePath, newLine, "utf8");
      console.log("+ added blueprint-context.xml to .gitignore");
    }
  }
}

function install(cwd, targetName) {
  const t = TARGETS[targetName];
  const destRoot = path.join(cwd, t.dir);
  const replace = { __UMBRA_ROOT__: t.dir };
  const files = getFilesForTarget(targetName);
  for (const { from, to } of files) {
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

  ensureRepomixConfig(cwd);
  ensureRepomixInstalled();
  ensureGitIgnore(cwd);

  console.log(`\nDone (${targetName}). ${t.done}`);
}

function uninstall(cwd, targetName) {
  const t = TARGETS[targetName];
  const destRoot = path.join(cwd, t.dir);
  const files = getFilesForTarget(targetName);
  for (const { to } of files) {
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
