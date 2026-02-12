import sys

def check_file(filepath):
    try:
        with open(filepath, 'rb') as f:
            content = f.read()
            for i, byte in enumerate(content):
                if byte > 127:
                    print(f"Non-ASCII byte {hex(byte)} found at position {i}")
        
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            for i, line in enumerate(lines):
                for char in line:
                    if ord(char) > 127:
                        print(f"Non-ASCII char {repr(char)} (code {ord(char)}) found at line {i+1}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1:
        check_file(sys.argv[1])
