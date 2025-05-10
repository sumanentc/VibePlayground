import sys
import os
import yaml
import json
import difflib
from typing import Dict, List, Tuple

class FileComparator:
    def __init__(self):
        self.colors = {
            'added': '\033[32m',    # Green
            'removed': '\033[31m', # Red
            'modified': '\033[34m', # Blue
            'unchanged': '\033[37m' # White
        }
        self.reset_color = '\033[0m'

    def detect_file_type(self, file_path: str) -> str:
        """Detect file type based on extension."""
        _, ext = os.path.splitext(file_path)
        return ext.lower().lstrip('.')

    def parse_file(self, file_path: str) -> Dict:
        """Parse file based on its type."""
        with open(file_path, 'r') as f:
            content = f.read()
        
        file_type = self.detect_file_type(file_path)
        
        if file_type == 'yaml':
            return yaml.safe_load(content)
        elif file_type == 'json':
            return json.loads(content)
        else:
            return content

    def format_diff(self, diff: List[str]) -> str:
        """Format diff output with colors."""
        formatted = []
        for line in diff:
            if line.startswith('+'):
                formatted.append(f"{self.colors['added']}{line}{self.reset_color}")
            elif line.startswith('-'):
                formatted.append(f"{self.colors['removed']}{line}{self.reset_color}")
            elif line.startswith('?'):
                formatted.append(f"{self.colors['modified']}{line}{self.reset_color}")
            else:
                formatted.append(f"{self.colors['unchanged']}{line}{self.reset_color}")
        return '\n'.join(formatted)

    def compare_files(self, file1: str, file2: str) -> str:
        """Compare two files and return formatted diff."""
        try:
            content1 = self.parse_file(file1)
            content2 = self.parse_file(file2)
            
            # Convert to string for comparison
            content1_str = json.dumps(content1, indent=2)
            content2_str = json.dumps(content2, indent=2)
            
            # Generate diff
            diff = list(difflib.unified_diff(
                content1_str.splitlines(),
                content2_str.splitlines(),
                fromfile=os.path.basename(file1),
                tofile=os.path.basename(file2)
            ))
            
            return self.format_diff(diff)
            
        except Exception as e:
            return f"Error comparing files: {str(e)}"

def main():
    if len(sys.argv) != 3:
        print("Usage: python file_compare.py <file1> <file2>")
        sys.exit(1)

    file1 = sys.argv[1]
    file2 = sys.argv[2]

    if not os.path.exists(file1) or not os.path.exists(file2):
        print("Error: One or both files do not exist")
        sys.exit(1)

    comparator = FileComparator()
    result = comparator.compare_files(file1, file2)
    print(result)

if __name__ == "__main__":
    main()
