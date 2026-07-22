import os
import sys
import fnmatch

def parse_ignore_file(ignore_path):
    patterns = []
    if os.path.exists(ignore_path):
        with open(ignore_path, 'r', encoding='utf-8', errors='ignore') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    if line.startswith('/'):
                        line = line[1:]
                    if line.endswith('/'):
                        line = line[:-1]
                    patterns.append(line)
    return patterns

def is_ignored(path, root_dir, ignore_patterns):
    rel_path = os.path.relpath(path, root_dir)
    # Always normalize path separators for fnmatch
    rel_path = rel_path.replace(os.sep, '/')

    if rel_path == '.' or rel_path == '':
        return False

    path_parts = rel_path.split('/')

    # Default strict ignores for non-code, IDE, tools, metadata, build outputs
    default_ignores = {
        '.git', '.svn', '.hg', 'node_modules', 'venv', '.venv', 'env', 
        'dist', 'build', '.blueprint', '.scout', '__pycache__', '.next', 
        '.cache', '.serena', '.vscode', '.idea', '.claudecode', '.opencode', 
        '.pi', '.agents', '.gemini', '.github', '.gitlab', '.history', 
        '.turbo', '.output', 'target', 'out', 'coverage', 'temp', 'tmp', '.temp', '.tmp'
    }

    for part in path_parts:
        if part in default_ignores:
            return True
        if part.startswith('.') and part not in ('.', '..'):
            return True

    for pattern in ignore_patterns:
        if (fnmatch.fnmatch(rel_path, pattern) or 
            fnmatch.fnmatch(rel_path, f"*/{pattern}") or 
            fnmatch.fnmatch(rel_path, f"{pattern}/*") or 
            fnmatch.fnmatch(rel_path, f"*/{pattern}/*") or
            any(fnmatch.fnmatch(part, pattern) for part in path_parts)):
            return True

    return False

def needs_blueprint(src_path, root_dir):
    rel_path = os.path.relpath(src_path, root_dir)
    blueprint_path = os.path.join(root_dir, '.blueprint', rel_path)
    
    # Change extension to .md
    blueprint_path = os.path.splitext(blueprint_path)[0] + '.md'
    
    if not os.path.exists(blueprint_path):
        return True
        
    # Check if source is newer than blueprint
    if os.path.getmtime(src_path) > os.path.getmtime(blueprint_path):
        return True
        
    return False

def scan_project(root_dir, limit=None):
    gitignore_path = os.path.join(root_dir, '.gitignore')
    blueprintignore_path = os.path.join(root_dir, '.blueprintignore')

    ignore_patterns = parse_ignore_file(gitignore_path) + parse_ignore_file(blueprintignore_path)
    
    # Common source code extensions (strictly exclude .md, docs, assets, binaries)
    valid_exts = {
        '.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go', '.rs', 
        '.cpp', '.c', '.h', '.hpp', '.cc', '.cxx', '.rb', '.php', 
        '.cs', '.kt', '.kts', '.swift', '.vue', '.svelte', '.m', '.mm', '.scala'
    }
    
    results = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter out ignored directories in-place to stop os.walk from entering them
        dirnames[:] = [d for d in dirnames if not is_ignored(os.path.join(dirpath, d), root_dir, ignore_patterns)]
        
        for file in filenames:
            file_path = os.path.join(dirpath, file)
            ext = os.path.splitext(file)[1].lower()
            
            # Strictly ignore any .md file (except system AGENTS.md which is not a code file to generate blueprint for)
            if ext not in valid_exts or file.lower().endswith('.md'):
                continue
                
            if is_ignored(file_path, root_dir, ignore_patterns):
                continue
                
            if needs_blueprint(file_path, root_dir):
                results.append(file_path)
                if limit and len(results) >= limit:
                    return results
                    
    return results

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scanner.py <project_root_dir> [limit]")
        sys.exit(1)
        
    project_root = sys.argv[1]
    limit = int(sys.argv[2]) if len(sys.argv) > 2 else None
    
    files_to_process = scan_project(project_root, limit)
    
    if not files_to_process:
        print("SCAN_COMPLETE: No files found needing blueprints.")
    else:
        for f in files_to_process:
            print(f)
