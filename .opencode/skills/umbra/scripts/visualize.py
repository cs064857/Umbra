import os
import re

def extract_mermaid_from_file(filepath):
    """Extracts the mermaid block from a markdown file."""
    content = ""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
    except Exception as e:
        print(f"Error reading {filepath}: {e}")
        return []

    # Regex to find mermaid blocks: ```mermaid ... ```
    pattern = r"```mermaid\n(.*?)\n```"
    matches = re.findall(pattern, content, re.DOTALL)
    
    # Filter out empty lines and comment lines (%%)
    edges = []
    for match in matches:
        lines = match.strip().split('\n')
        for line in lines:
            cleaned = line.strip()
            if cleaned and not cleaned.startswith('graph') and not cleaned.startswith('%%'):
                 edges.append(cleaned)
    return edges

def visualize_blueprints():
    """Scans all .blueprint files and aggregates mermaid diagrams."""
    project_root = os.getcwd()
    blueprint_dir = os.path.join(project_root, ".blueprint")
    
    if not os.path.exists(blueprint_dir):
        print("Error: .blueprint directory not found.")
        return

    all_edges = set() # Use a set to deduplicate edges
    
    for root, _, files in os.walk(blueprint_dir):
        for file in files:
            if file.endswith(".md") and file != "README.md":
                filepath = os.path.join(root, file)
                edges = extract_mermaid_from_file(filepath)
                for edge in edges:
                    all_edges.add(edge)

    if not all_edges:
        print("No dependency topologies found in blueprints.")
        return

    print("### 全域依賴拓撲圖 (Global Dependency Topology)")
    print("```mermaid")
    print("graph TD")
    for edge in sorted(list(all_edges)):
        print(f"    {edge}")
    print("```")

if __name__ == "__main__":
    visualize_blueprints()
