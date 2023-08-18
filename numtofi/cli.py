from .core import number_to_word

def main():
    import argparse

    parser = argparse.ArgumentParser(description="Convert a number to its Finnish textual representation.")
    parser.add_argument('number', type=int, help='Number to convert.')
    parser.add_argument('--space', action='store_true', help='Add a space between words.')

    args = parser.parse_args()

    print(number_to_word(args.number, args.space))

if __name__ == "__main__":
    main()
