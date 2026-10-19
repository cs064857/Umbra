#!/usr/bin/env node
// ponytail: multi-target copy; --opencode (default) | --pi
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { execSync } = require("node:child_process");

const ROOT = path.join(__dirname, "..", "templates");
const UMBRA_REPO_ROOT = path.resolve(__dirname, "..");
const REGISTRY_DIR = path.join(os.homedir(), ".umbra");
const REGISTRY_FILE = path.join(REGISTRY_DIR, "projects.json");
const SCAN_SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".opencode",
  ".pi",
  ".blueprint",
  ".scout",
  "dist",
  "build",
  "out",
  ".next",
  ".nuxt",
  "target",
  "vendor",
  ".venv",
  "venv",
  "__pycache__",
]);

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
  umbra init [--opencode|--pi] [-e|--exclude]             Copy templates (default: --opencode)
  umbra update [--opencode|--pi] [-e|--exclude]           Overwrite managed files in current project
  umbra update --all [-s|--scan [dir]] [--opencode|--pi]  One-click update ALL registered projects
  umbra scan [dir]                                        Auto-discover existing Umbra projects under dir
  umbra list                                              List all registered Umbra projects
  umbra uninstall [--opencode|--pi]                       Remove managed files & unregister project

Flags:
  --opencode, --pi    Target agent dir (default: --opencode)
  -a, --all           Apply update across all registered projects (~/.umbra/projects.json)
  -s, --scan [dir]    Scan directory tree to discover & register existing Umbra projects
  -e, --exclude, -i   Add managed files to .git/info/exclude (local ignore)

Install:
  npm i -g git+https://github.com/YOU/umbra.git
  npx --yes github:YOU/umbra init --pi -e
`);
}

function parseArgs(argv) {
  const flags = argv.filter((a) => a.startsWith("-"));
  const positionals = argv.filter((a) => !a.startsWith("-"));
  const cmd = positionals[0] || "help";
  const dirArg = positionals[1] || null;
  let target = "opencode";
  let targetExplicit = false;
  let exclude = false;
  let all = false;
  let scan = false;

  for (const f of flags) {
    if (f === "--help" || f === "-h") return { cmd: "help", target, targetExplicit, exclude, all, scan, dirArg };
    if (f === "-e" || f === "--exclude" || f === "-i" || f === "--gitignore" || f === "-l" || f === "--local") {
      exclude = true;
      continue;
    }
    if (f === "-a" || f === "--all") {
      all = true;
      continue;
    }
    if (f === "-s" || f === "--scan") {
      scan = true;
      continue;
    }

    const name = f.replace(/^--?/, "");
    if (TARGETS[name]) {
      target = name;
      targetExplicit = true;
    } else {
      console.error(`unknown flag: ${f} (want --${Object.keys(TARGETS).join(" | --")} | -a | --all | -s | --scan | -e | --exclude)`);
      process.exit(1);
    }
  }
  return { cmd, target, targetExplicit, exclude, all, scan, dirArg };
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

function resolveGitDir(cwd) {
  const gitPath = path.join(cwd, ".git");
  if (!fs.existsSync(gitPath)) return null;

  const st = fs.statSync(gitPath);
  if (st.isFile()) {
    const content = fs.readFileSync(gitPath, "utf8").trim();
    const match = content.match(/^gitdir:\s*(.+)$/i);
    if (match) {
      return path.isAbsolute(match[1]) ? match[1] : path.resolve(cwd, match[1]);
    }
  }
  return gitPath;
}

function hasGitExclude(cwd, targetDir) {
  const gitDir = resolveGitDir(cwd);
  if (!gitDir) return false;
  const excludePath = path.join(gitDir, "info", "exclude");
  if (!fs.existsSync(excludePath)) return false;
  const content = fs.readFileSync(excludePath, "utf8");
  return content.includes(`${targetDir}/`);
}

function ensureGitExclude(cwd, targetDir) {
  const gitDir = resolveGitDir(cwd);
  if (!gitDir) return;

  const infoDir = path.join(gitDir, "info");
  fs.mkdirSync(infoDir, { recursive: true });
  const excludePath = path.join(infoDir, "exclude");

  let existing = "";
  if (fs.existsSync(excludePath)) {
    existing = fs.readFileSync(excludePath, "utf8");
  }

  const targets = [`${targetDir}/`, "repomix.config.json", "blueprint-context.xml"];
  const added = [];

  for (const item of targets) {
    if (!existing.includes(item)) {
      existing = existing.endsWith("\n") || existing.length === 0 ? existing + item + "\n" : existing + "\n" + item + "\n";
      added.push(item);
    }
  }

  if (added.length > 0) {
    fs.writeFileSync(excludePath, existing, "utf8");
    console.log(`+ added ${added.join(", ")} to .git/info/exclude`);
  }
}

function normalizeProjectKey(p) {
  const resolved = path.resolve(p);
  return process.platform === "win32" ? resolved.toLowerCase() : resolved;
}

function loadRegistry() {
  if (!fs.existsSync(REGISTRY_FILE)) return [];
  try {
    const data = JSON.parse(fs.readFileSync(REGISTRY_FILE, "utf8"));
    return Array.isArray(data.projects) ? data.projects : [];
  } catch (e) {
    return [];
  }
}

function saveRegistry(projects) {
  fs.mkdirSync(REGISTRY_DIR, { recursive: true });
  fs.writeFileSync(REGISTRY_FILE, JSON.stringify({ projects }, null, 2) + "\n", "utf8");
}

function registerProject(cwd, targetName, exclude) {
  const resolvedPath = path.resolve(cwd);
  const key = normalizeProjectKey(resolvedPath);
  const projects = loadRegistry();
  const idx = projects.findIndex((p) => normalizeProjectKey(p.path) === key && p.target === targetName);
  const entry = {
    path: resolvedPath,
    target: targetName,
    exclude: Boolean(exclude),
    updatedAt: new Date().toISOString(),
  };

  if (idx >= 0) {
    projects[idx] = entry;
  } else {
    projects.push(entry);
  }
  saveRegistry(projects);
}

function unregisterProject(cwd, targetName) {
  const key = normalizeProjectKey(cwd);
  const projects = loadRegistry();
  const filtered = projects.filter((p) => !(normalizeProjectKey(p.path) === key && p.target === targetName));
  if (filtered.length !== projects.length) {
    saveRegistry(filtered);
  }
}

function detectTargetsInDir(dir) {
  if (normalizeProjectKey(dir) === normalizeProjectKey(UMBRA_REPO_ROOT)) return [];
  const found = [];
  for (const [targetName, t] of Object.entries(TARGETS)) {
    const markerA = path.join(dir, t.dir, "agents", "umbra-orchestrator.md");
    const markerB = path.join(dir, t.dir, "rules", "umbra.md");
    if (fs.existsSync(markerA) || fs.existsSync(markerB)) {
      const exclude = hasGitExclude(dir, t.dir);
      found.push({ target: targetName, exclude });
    }
  }
  return found;
}

function scanProjects(rootDir, maxDepth = 5) {
  const startDir = path.resolve(rootDir);
  if (!fs.existsSync(startDir)) {
    console.error(`Directory not found: ${startDir}`);
    process.exit(1);
  }

  console.log(`Scanning for Umbra-configured projects under: ${startDir} ...`);
  const discovered = [];

  function walk(currentDir, depth) {
    if (depth > maxDepth) return;
    const detected = detectTargetsInDir(currentDir);
    for (const { target, exclude } of detected) {
      registerProject(currentDir, target, exclude);
      discovered.push({ path: currentDir, target, exclude });
    }

    let entries = [];
    try {
      entries = fs.readdirSync(currentDir, { withFileTypes: true });
    } catch (e) {
      return;
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;
      if (SCAN_SKIP_DIRS.has(entry.name) || entry.name.startsWith(".")) continue;
      walk(path.join(currentDir, entry.name), depth + 1);
    }
  }

  walk(startDir, 0);

  if (discovered.length === 0) {
    console.log("No Umbra projects discovered in scan.");
  } else {
    for (const item of discovered) {
      console.log(`✓ Registered: ${item.path} (${item.target}${item.exclude ? ", exclude" : ""})`);
    }
    console.log(`\nRegistered ${discovered.length} project target(s) in ${REGISTRY_FILE}`);
  }
  return discovered;
}

function listProjects() {
  const projects = loadRegistry();
  if (projects.length === 0) {
    console.log(`No registered Umbra projects yet (${REGISTRY_FILE}).`);
    console.log(`Tip: run 'umbra scan <workspace-dir>' to auto-discover existing projects, or 'umbra init' inside a project.`);
    return;
  }

  console.log(`Registered Umbra projects (${REGISTRY_FILE}):\n`);
  for (const p of projects) {
    const exists = fs.existsSync(p.path);
    const status = exists ? "ok" : "missing";
    console.log(`  • ${p.path}  [--${p.target}${p.exclude ? " -e" : ""}]  (${status})`);
  }
}

function install(cwd, targetName, exclude, opts = {}) {
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
  if (!opts.skipRepomixCheck) {
    ensureRepomixInstalled();
  }
  ensureGitIgnore(cwd);

  if (exclude) {
    ensureGitExclude(cwd, t.dir);
  }

  registerProject(cwd, targetName, exclude);

  if (opts.batchMode) return;

  const isGit = fs.existsSync(path.join(cwd, ".git"));

  console.log(`\n✓ Successfully initialized Umbra (${targetName})!\n`);
  console.log("Next steps:");
  console.log(`  1. Get started:`);
  console.log(`     • ${t.done}`);

  if (isGit) {
    console.log(`\n  2. Version Control:`);
    if (exclude) {
      console.log(`     • Managed files added to .git/info/exclude (local only, repo untouched).`);
    } else {
      console.log(`     • Share with team (Recommended):`);
      console.log(`       git add ${t.dir} repomix.config.json .gitignore`);
      console.log(`     • Or ignore locally (keep repo untouched):`);
      console.log(`       echo "${t.dir}/" >> .git/info/exclude`);
      console.log(`       (or re-run with: umbra update -e)`);
    }
  }
}

function updateAllProjects({ targetFilter, forceExclude, scan, scanDir, cwd }) {
  if (scan) {
    scanProjects(scanDir || cwd);
    console.log("");
  } else {
    const cwdDetected = detectTargetsInDir(cwd);
    for (const { target, exclude } of cwdDetected) {
      registerProject(cwd, target, exclude);
    }
  }

  const projects = loadRegistry();
  if (projects.length === 0) {
    console.log(`No registered Umbra projects found in ${REGISTRY_FILE}.`);
    console.log(`Run 'umbra scan <workspace-dir>' or 'umbra update --all --scan <workspace-dir>' to discover existing projects.`);
    return;
  }

  ensureRepomixInstalled();

  const kept = [];
  let updatedCount = 0;

  for (const p of projects) {
    if (!fs.existsSync(p.path)) {
      console.warn(`- skip missing project (removed from registry): ${p.path}`);
      continue;
    }

    if (targetFilter && p.target !== targetFilter) {
      kept.push(p);
      continue;
    }

    const useExclude = forceExclude ? true : Boolean(p.exclude) || hasGitExclude(p.path, TARGETS[p.target]?.dir || ".opencode");
    console.log(`\n=== Updating ${p.path} (--${p.target}${useExclude ? " -e" : ""}) ===`);
    install(p.path, p.target, useExclude, { skipRepomixCheck: true, batchMode: true });
    kept.push({
      path: path.resolve(p.path),
      target: p.target,
      exclude: useExclude,
      updatedAt: new Date().toISOString(),
    });
    updatedCount++;
  }

  saveRegistry(kept);
  console.log(`\n✓ Successfully updated ${updatedCount} project(s)!`);
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
  unregisterProject(cwd, targetName);
}

const { cmd, target, targetExplicit, exclude, all, scan, dirArg } = parseArgs(process.argv.slice(2));
const cwd = process.cwd();

if (cmd === "scan") {
  scanProjects(dirArg || cwd);
} else if (cmd === "list" || cmd === "ls") {
  listProjects();
} else if (cmd === "update" && all) {
  updateAllProjects({
    targetFilter: targetExplicit ? target : null,
    forceExclude: exclude,
    scan,
    scanDir: dirArg,
    cwd,
  });
} else if (cmd === "init" || cmd === "update") {
  install(cwd, target, exclude);
} else if (cmd === "uninstall") {
  uninstall(cwd, target);
} else {
  usage();
}
