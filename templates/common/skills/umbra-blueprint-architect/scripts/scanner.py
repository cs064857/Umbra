import os
import sys
import fnmatch

def parse_ignore_file(ignore_path):
    patterns = []
    if os.path.exists(ignore_path):
        with open(ignore_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#'):
                    patterns.append(line)
    return patterns

def is_ignored(path, root_dir, ignore_patterns):
    rel_path = os.path.relpath(path, root_dir)
    # Always normalize path separators for fnmatch
    rel_path = rel_path.replace(os.sep, '/')

    # Check default strict ignores
    path_parts = rel_path.split('/')
    default_ignores = {'.git', 'node_modules', 'venv', '.venv', 'env', 'dist', 'build', '.blueprint', '__pycache__', '.next', '.cache'}
    if any(part in default_ignores for part in path_parts):
        return True

    # Check .blueprintignore patterns
    for pattern in ignore_patterns:
        # Simple fnmatch check
        if fnmatch.fnmatch(rel_path, pattern) or fnmatch.fnmatch(rel_path, f"*/{pattern}") or fnmatch.fnmatch(rel_path, f"{pattern}/*") or fnmatch.fnmatch(rel_path, f"*/{pattern}/*"):
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
    ignore_path = os.path.join(root_dir, '.blueprintignore')
    ignore_patterns = parse_ignore_file(ignore_path)
    
    # Common source extensions
    valid_exts = {'.py', '.js', '.ts', '.jsx', '.tsx', '.java', '.go', '.rs', '.cpp', '.c', '.h', '.rb', '.php', '.cs'}
    
    results = []
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Filter out ignored directories in-place to stop os.walk from entering them
        dirnames[:] = [d for d in dirnames if not is_ignored(os.path.join(dirpath, d), root_dir, ignore_patterns)]
        
        for file in filenames:
            file_path = os.path.join(dirpath, file)
            ext = os.path.splitext(file)[1].lower()
            
            if ext not in valid_exts:
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
