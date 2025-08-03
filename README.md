# VertEdit - VS Code extension for WYSIWYG vertical text editing

A VS Code extension that provides WYSIWYG vertical text editing.
This tool is intended for writing novels in the traditional Japanese style known as tategaki (縦書き).
Useful for writing Japanese novels and literature!

## Features
- Vertical text editing (CSS writing-mode: vertical-rl)
- Tate-chu-yoko: 2-3 digit numbers are displayed horizontally within vertical text

## Usage
1. Open a Japanese text file
2. Click the book icon at top left of the editor
3. The text will be displayed vertically in a new panel

## Installation
1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npx vsce package` to create VSIX file
4. Install VSIX file
    ```
    code --install-extension vertedit-0.1.1.vsix
    ```

## License
This repository is licensed under the MIT License.