# Developer Guide: Adding New Boards

This project supports 9x9, 13x13, and 19x19 board sizes. It also includes a "Hardcore" mode where players must guess the exact point margin.

## How to add new boards

You can add new boards manually by editing the respective size file (`boards9.js`, `boards13.js`, or `boards19.js`).

### Using the Board Editor

A visual editor is provided in `editor.html` to help you generate board strings.

1.  Open `editor.html` in your browser.
2.  Select the desired board size.
3.  Click on the grid intersections to place stones:
    -   Click an empty intersection to place a **Black** (O) stone.
    -   Click again to change it to a **White** (X) stone.
    -   Click again to clear it.
4.  Optionally, paste a flat space-separated string OR an **SGF file** into the text area to render an existing position.
5.  Set the **Lead** amount for Hardcore mode.
6.  Click **Copy to Clipboard** to get the formatted code block.
7.  Paste this block into the appropriate array in `boards9.js`, `boards13.js`, or `boards19.js`.

### Manual Entry Format

Each board file (e.g., `boards9.js`) contains an array of objects. Example:

```javascript
boards9 = [
    {
      "map": `
. . . . X O . . .
. . . . X O O . .
...
`.trim(),
      "lead": 5
    },
    ...
];
```

-   **map**: A string representing the board using a template literal. Each row is separated by `\n`, and each point is separated by a space.
    -   `.`: Empty point
    -   `O`: Black stone
    -   `X`: White stone
-   **lead**: An integer representing the winning margin.
    -   **Positive** values indicate Black is winning.
    -   **Negative** values indicate White is winning.
    -   `0` or `null` defaults to a Black win in regular mode.

## Regular Mode: Determining the Winner

In regular mode, the game determines the correct side to choose based on the `lead` property:

1.  It checks the `lead` of the original board position.
2.  If `lead` is `>= 0` or `null`, the winner is **Black**.
3.  If `lead` is `< 0`, the winner is **White**.
4.  **Note on Inversion:** The game randomly "inverts" boards (swapping Black and White stones). If a board is inverted, the target answer is also automatically flipped.

