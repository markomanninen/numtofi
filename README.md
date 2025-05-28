# `numtofi` - Convert numbers to Finnish textual representation

`numtofi` is a Python module that offers functionality to convert integers into their Finnish textual representation. This module also comes with a command-line interface (CLI) tool to quickly get the Finnish representation for any number from the command line.

## Installation

```bash
pip install numtofi
```

## Usage

### As a Python Module

```python
from numtofi import number_to_text

print(number_to_text(45))  # Outputs "neljäkymmentäviisi"
```

### Command-Line Interface (CLI)

After installation, you can use the `numtofi` command directly from your terminal:

```bash
$ numtofi 45
neljäkymmentäviisi

$ numtofi 5000000
viisi miljoonaa

$ numtofi 5000000 --nospaces
viisimiljoonaa

$ numtofi 5000000 --length
15

```

### GitHub SPA Interface

This project also includes a client-side Single Page Application (SPA) that can be used to convert numbers to Finnish text directly in your browser.

**How to use:**

1.  Navigate to the GitHub Pages URL for this repository (e.g., `https://<your-username>.github.io/<repository-name>/`).
2.  Enter a number in the input field.
3.  Click the "Convert" button.
4.  The Finnish textual representation of the number will be displayed below the button.

This provides a user-friendly graphical interface for the `numtofi` functionality.

## Parameters

- `number_to_text(n, spaces=False)`:
  - `n (int)`: The number to convert.
  - `spaces (bool)`: If `False`, removes spaces between words. Default is `True`.

- `number_to_text_length(n, spaces=False)`:
  - `n (int)`: The number to the length of the textual representation.
  - `spaces (bool)`: If `False`, removes spaces between words. Default is `True`.

## Testing

Tests are provided in the `tests` directory. To run the tests:

1. Navigate to the project root directory.
2. Run:

```bash
python -m unittest discover tests
```

## Update PYPI package

```bash
python setup.py sdist bdist_wheel
```

```bash
python -m twine upload dist/*
```

## Contributing

Contributions are welcome! Please make sure to update tests as appropriate when proposing changes.

## License

[MIT](LICENSE)
