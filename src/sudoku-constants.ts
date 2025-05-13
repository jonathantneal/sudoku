/** Number of cells in a line of a Sudoku grid. */
export const LINE_SIZE = 9

/** Number of cells in a line of a Sudoku box. */
export const BOX_SIZE = 3

/** Number of cells in a Sudoku grid. */
export const GRID_SIZE = LINE_SIZE * LINE_SIZE

/** Minimum number of givens in a Sudoku grid. */
export const MIN_GIVENS = LINE_SIZE * 2

/** Maximum number of givens in a Sudoku grid. */
export const MAX_GIVENS = GRID_SIZE

/** List of digits used to fill the grid. */
export const DIGITS: Digit[] = [1, 2, 3, 4, 5, 6, 7, 8, 9]

/** Valid digit in a Sudoku puzzle. */
export type Digit = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9

/** Possible digit in a Sudoku puzzle, where 0 represents an empty cell. */
export type Proposal = 0 | Digit
