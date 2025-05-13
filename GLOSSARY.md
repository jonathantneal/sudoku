# Sudoku Terminology

## Grid Structure

- **cell**: An element capable of containing a single digit. There are 81 cells in a grid and 9 cells in each row, column, and box.
- **box**: A group of 9 cells in a 3×3 formation. There are 9 boxes in a grid.
- **grid**: The full 9×9 puzzle, consisting of 81 cells arranged into 9 rows, 9 columns, and 9 boxes.

```html
<a-cell part="in-row-1 in-col-1 in-tower-1 in-floor-3">
```

```html
<a-box part="in-tower-1 in-floor-3">
```

```html
<a-grid>
```

```ts
interface Cell {
  value: number
}

interface Box {
  cells: Cell[]
}

interface Grid {
  boxes: Box[]
  cells: Cell[]
}
```

## Grid Segments

- **row**: A horizontal line of 9 cells. There are 9 rows in a grid.
- **column**: A vertical line of 9 cells. There are 9 columns in a grid.
- **line**: A horizontal row or vertical column. There are 18 lines in total.
- **floor**: A horizontal band made of 3 rows and the 3 boxes they span. There are 3 floors in a grid, each containing 27 cells.
- **tower**: A vertical band made of 3 columns and the 3 boxes they span. There are 3 towers in a grid, each containing 27 cells.
- **chute**: A general term for either a floor or a tower.
- **house**: A set of 9 cells that forms a row, column, or box. Each cell belongs to exactly 3 houses.

## Cell States

- **highlighted**: A cell that is visually emphasized.
- **given**: A digit pre-filled in the puzzle at the start.
- **unsolved**: A cell that does not yet contain a digit.
- **solved**: A cell that contains a digit, placed without violating Sudoku rules.
- **peer**: A cell that shares a house with a given cell (i.e., lies in the same row, column, or box).

## Grid States

- **starting**: The initial state of the grid, showing only the given digits.
- **solved**: A completed grid where every cell contains a valid digit and all Sudoku rules are followed.
- **contradicting**: A state where at least one rule of Sudoku is violated — for example, duplicate digits within a house.
