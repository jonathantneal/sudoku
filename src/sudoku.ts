import { BOX_SIZE, DIGITS, type Digit, GRID_SIZE, LINE_SIZE, MAX_GIVENS, MIN_GIVENS, type Proposal } from "./sudoku-constants.ts"

export class Grid<T> extends Array<T> {
	constructor(map: (index: number) => T) {
		super(GRID_SIZE)

		this.reset(map)
	}

	reset(map: (index: number) => T): void {
		for (let index = 0; index < GRID_SIZE; ++index) {
			this[index] = map(index)
		}
	}
}

export class Sudoku extends Grid<Sudoku.Cell> {
	givens: Sudoku.Givens = {
		min: MIN_GIVENS,
		max: MAX_GIVENS,
	}

	constructor(givens = null as unknown as Partial<Sudoku.Givens>) {
		super(Sudoku.generateMapper(givens))
	}

	// @ts-expect-error to overide of the super type
	reset(givens = null as unknown as Partial<Sudoku.Givens>): void {
		super.reset(Sudoku.generateMapper(givens ?? this.givens))
	}

	static generateMapper(givens = null as unknown as Partial<Sudoku.Givens>) {
		givens = Object.freeze({
			min: Math.max(MIN_GIVENS, Number(givens.min) || MIN_GIVENS),
			max: Math.min(MAX_GIVENS, Number(givens.max) || MAX_GIVENS),
		})

		const solutions = new Grid(() => 0 as Digit)

		generateSolution(solutions, 0)

		const proposals = new Grid((index) => solutions[index]! as Proposal)

		generateProposal(proposals, givens.min!, givens.max!)

		return (index: number) => {
			const solution = solutions[index]!
			const proposal = proposals[index]!
			const row = getRowFromIndex(index)
			const col = getColFromIndex(index)
			const box = Math.floor(row / BOX_SIZE) * BOX_SIZE + Math.floor(col / BOX_SIZE)
			const given = solution === proposal

			return {
				index,
				solution,
				proposal,
				given,
				row,
				col,
				box,
			}
		}
	}
}

export namespace Sudoku {
	export interface Cell {
		index: number
		solution: Digit
		proposal: Proposal
		given: boolean
		row: number
		col: number
		box: number
	}

	export interface Givens {
		min: number
		max: number
	}
}

// #region Internals

/** Recursively fills the grid using backtracking to generate a valid Sudoku solution. */
const generateSolution = (cells: number[], emptyIndex: number): boolean => {
	// return true if every digit is solved
	if (emptyIndex === -1) {
		return true
	}

	const candidates = [...DIGITS]

	shuffle(candidates)

	for (const digit of candidates) {
		if (isValidPlacement(cells, emptyIndex, digit)) {
			cells[emptyIndex] = digit

			// return true if every digit is solved
			if (generateSolution(cells, cells.findIndex(isValueZero))) {
				return true
			}

			cells[emptyIndex] = 0
		}
	}

	return false
}

/** Returns a Sudoku puzzle from a fully solved Soduku puzzle. */
const generateProposal = (cells: number[], min: number, max: number): void => {
	const givens = getRandomInt(min, max)
	const indices = new Grid((index) => index)

	shuffle(indices)

	let removed = 0

	for (const index of indices) {
		if (GRID_SIZE - removed <= givens) break

		const backup = cells[index]

		cells[index] = 0

		if (!hasUniqueSolution([...cells])) {
			cells[index] = backup!

			continue
		}

		++removed
	}
}

/** Checks if a digit can be legally placed at the given index. */
const isValidPlacement = (cells: number[], index: number, digit: number): boolean => {
	const row = getRowFromIndex(index)
	const col = getColFromIndex(index)
	const boxRow = Math.floor(row / BOX_SIZE) * BOX_SIZE
	const boxCol = Math.floor(col / BOX_SIZE) * BOX_SIZE

	for (let i = 0; i < LINE_SIZE; ++i) {
		// check row, column, and box
		if (
			cells[row * LINE_SIZE + i] === digit ||
			cells[i * LINE_SIZE + col] === digit ||
			cells[(boxRow + Math.floor(i / BOX_SIZE)) * LINE_SIZE + (boxCol + (i % BOX_SIZE))] === digit
		) {
			return false
		}
	}

	return true
}

const isValueZero = (value: number) => value === 0

/** Returns a random integer between min and max (inclusive) */
const getRandomInt = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1)) + min

/** Checks whether a puzzle has exactly one valid solution. */
const hasUniqueSolution = (cells: number[]): boolean => {
	let count = 0

	const hasOneSolution = (index: number): boolean => {
		// Early exit if more than 1 solution found
		if (count > 1) {
			return true
		}

		const emptyIndex = cells.findIndex(isValueZero, index)

		if (emptyIndex === -1) {
			++count

			return count > 1
		}

		for (let digit = 1; digit <= LINE_SIZE; ++digit) {
			if (isValidPlacement(cells, emptyIndex, digit)) {
				cells[emptyIndex] = digit

				if (hasOneSolution(emptyIndex)) {
					return true
				}

				cells[emptyIndex] = 0
			}
		}

		return false
	}

	hasOneSolution(0)

	return count === 1
}

/** Randomly shuffles the digits array in place using Fisher-Yates algorithm */
const shuffle = <T>(values: T[]): void => {
	for (let i = values.length - 1; i > 0; --i) {
		const j = Math.floor(Math.random() * (i + 1))

		// re-assign shuffled values
		;[values[i], values[j]] = [values[j]!, values[i]!]
	}
}

const getRowFromIndex = (index: number) => Math.floor(index / LINE_SIZE)

const getColFromIndex = (index: number) => index % LINE_SIZE

// #endregion
