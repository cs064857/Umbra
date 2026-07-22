import sys
import os
import argparse

def create_scaffold(file_path):
    """
    Creates a standard blueprint scaffold in the .blueprint directory for the given source file path.
    """
    # 1. Normalize paths
    project_root = os.getcwd()
    abs_file_path = os.path.abspath(file_path)
    
    # Check if the file is within the project
    if not abs_file_path.startswith(project_root):
        print(f"Error: Path {file_path} is outside the project root {project_root}")
        sys.exit(1)
        
    rel_path = os.path.relpath(abs_file_path, project_root)
    
    # 2. Determine blueprint destination
    blueprint_dir = os.path.join(project_root, ".blueprint")
    dest_path = os.path.join(blueprint_dir, rel_path)
    
    # If original file has an extension, append .md, otherwise just add .md
    if not dest_path.endswith(".md"):
        dest_path += ".md"
        
    # 3. Create directories if necessary
    os.makedirs(os.path.dirname(dest_path), exist_ok=True)
    
    if os.path.exists(dest_path):
        print(f"Blueprint already exists at: {dest_path}")
        sys.exit(0)
        
    # 4. Generate scaffold content
    module_name = os.path.basename(file_path)
    
    template = f"""# Blueprint: {module_name}
> Original Source: `{rel_path}`

## 職責契約 (Responsibility Contract)
- **Do**: 
  - (在這裡填寫該模組主要負責的功能)
- **Do NOT**:
  - (在這裡填寫該模組嚴禁越權處理的事項)

## 接口摘要 (Interface Summary)
### `方法/類別名稱`
- **輸入 (Input)**: 
- **輸出 (Output/Side Effects)**: 
- **約束條件 (Constraints)**: 

## 依賴拓撲 (Dependency Topology)
- **入向依賴 (被誰呼叫)**:
- **出向依賴 (呼叫了誰)**:

```mermaid
graph TD
    %% 在此繪製相依關係，例如：
    %% Provider --> {module_name} --> Consumer
```
"""
    
    # 5. Write to file
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(template)
        
    print(f"Created scaffold at: {dest_path}")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Create a standard blueprint scaffold.")
    parser.add_argument("filepath", help="Relative or absolute path to the source code file.")
    args = parser.parse_args()
    
    create_scaffold(args.filepath)
