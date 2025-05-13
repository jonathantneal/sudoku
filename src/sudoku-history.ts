import type { Proposal } from "./sudoku-constants"

export class SudokuHistory extends Array<SudokuHistory.Entry> {
	index = 0

	reset(): void {
		this.splice(0)

		this.index = 0
	}

	add(index: number, from: Proposal, to: Proposal): void {
		this.splice(this.index)

		this.index = this.push({ index, from, to })
	}

	undo(): SudokuHistory.Entry | null {
		if (this.canUndo) {
			return this[--this.index] ?? null
		}

		return null
	}

	redo(): SudokuHistory.Entry | null {
		if (this.canRedo) {
			return this[this.index++] ?? null
		}

		return null
	}

	get canUndo(): boolean {
		return this.index > 0
	}

	get canRedo(): boolean {
		return this.index < this.length
	}
}

export namespace SudokuHistory {
	export interface Entry {
		index: number
		from: Proposal
		to: Proposal
	}
}
