import sys

def main():
    # Get the input argument from command line
    input_text = sys.argv[1] if len(sys.argv) > 1 else "World"
    # Simple response
    result = f"Hello, {input_text}!"
    print(result)

if __name__ == "__main__":
    main()