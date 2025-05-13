import { DIGITS, type Digit, LINE_SIZE, type Proposal } from "./sudoku-constants.ts"
import { SudokuHistory } from "./sudoku-history.ts"
import { Sudoku } from "./sudoku.ts"

export class SudokuUI extends EventTarget {
	game: Sudoku

	history = new SudokuHistory()

	/** Index of the currently focused Sudoku cell. */
	#focused = -1

	/** Whether the Sudoku game has been solved. */
	#solved = false

	declare nodes: {
		screen: HTMLElement
		grid: HTMLElement
		texts: Text[]
		cells: HTMLElement[]
		controls: HTMLElement
		undo: HTMLElement
		redo: HTMLElement
		reset: HTMLElement
		buttons: HTMLElement[]
	}

	get focused(): Sudoku.Cell | null {
		return this.game[this.#focused] ?? null
	}

	set focused(cell: Sudoku.Cell | null) {
		this.#focused = cell?.index ?? -1
	}

	constructor(givens = null as unknown as Partial<Sudoku.Givens>) {
		super()

		this.game = new Sudoku(givens)

		const texts = this.game.map((cell) => new Text(SudokuUI.getStringFromProposal(cell.proposal)))

		this.nodes = {
			screen: $create("div", {
				part: "screen",
				onpointerdown: (event: MouseEvent) => {
					if (!this.nodes.grid.contains(event.target as Node) && !this.nodes.controls.contains(event.target as Node)) {
						this.dispatchEvent(new CustomEvent("cell:focus", { detail: null }))
					}
				},
				onkeydown: (event: KeyboardEvent) => {
					const to = Number(event.key) as Digit

					if (!this.#solved) {
						if (DIGITS.includes(to)) {
							if (this.focused) {
								this.dispatchEvent(new CustomEvent("input:digit", { detail: to }))
							}
						} else if (event.key === "Backspace") {
							this.dispatchEvent(new CustomEvent("history", { detail: "undo" }))
						}
					}
				},
			}),
			grid: $create("div", { part: "grid" }),
			texts,
			cells: this.game.map((cell) => {
				const button = $create("button", {
					part: `cell nth-row-${cell.row + 1} nth-col-${cell.col + 1} nth-box-${cell.box + 1}`,
					tabIndex: -1,
					onpointerdown: () => {
						button.part.add("active")

						button.focus()
					},
					onpointerup: () => {
						button.part.remove("active")
					},
					onfocus: () => {
						this.dispatchEvent(new CustomEvent("cell:focus", { detail: cell.index }))
					},
				})

				button.part.toggle("given", cell.proposal === cell.solution)

				button.append(texts[cell.index]!)

				return button
			}),
			controls: $create("div", { part: "controls" }),
			buttons: [...DIGITS].map((to) => {
				const proposalKey = SudokuUI.getStringFromProposal(to)

				const button = $create("button", {
					part: "button digit-button",
					textContent: proposalKey,
					onpointerdown: () => {
						button.part.toggle("active", true)

						if (this.focused) {
							this.dispatchEvent(new CustomEvent("input:digit", { detail: to }))
						}
					},
					onpointerup: (event: Event) => {
						button.part.toggle("active", false)

						event.preventDefault()
					},
				})

				return button
			}),
			undo: $create("button", {
				part: "button undo-button disabled",
				textContent: "⇤",
				onclick: () => {
					const event = new CustomEvent("history", { detail: "undo" })

					this.dispatchEvent(event)
				},
			}),
			redo: $create("button", {
				part: "button redo-button disabled",
				textContent: "⇥",
				onclick: () => {
					const event = new CustomEvent("history", { detail: "redo" })

					this.dispatchEvent(event)
				},
			}),
			reset: $create("button", {
				part: "button reset-button",
				textContent: "↯",
				onclick: () => {
					const event = new CustomEvent("game:reset")

					this.dispatchEvent(event)
				},
			}),
		}

		this.nodes.grid.append(...this.nodes.cells)
		this.nodes.controls.append(...this.nodes.buttons, this.nodes.undo, this.nodes.reset, this.nodes.redo)

		this.nodes.screen.append(this.nodes.grid, this.nodes.controls)

		this.addEventListener("input:digit", this.#handleInputDigit)
		this.addEventListener("history", this.#handleHistory)
		this.addEventListener("cell:focus", this.#handleCellFocus)
		this.addEventListener("game:reset", this.#handleGameReset)

		this.#update()
	}

	#update = () => {
		const digits = Object.fromEntries(DIGITS.map((digit) => [digit, LINE_SIZE])) as Record<Digit, number>
		const { focused } = this

		this.#solved = true

		for (const cell of this.game) {
			if (cell.proposal) {
				--digits[cell.proposal]
			}

			const isPeerCol = cell !== focused && cell.col === focused?.col
			const isPeerRow = cell !== focused && cell.row === focused?.row
			const isPeerBox = cell !== focused && cell.box === focused?.box

			this.nodes.cells[cell.index]!.part.toggle("focus", cell === focused)
			this.nodes.cells[cell.index]!.part.toggle("focus-digit", cell.proposal === focused?.proposal)

			this.nodes.cells[cell.index]!.part.toggle("peer-col", isPeerCol)
			this.nodes.cells[cell.index]!.part.toggle("peer-row", isPeerRow)
			this.nodes.cells[cell.index]!.part.toggle("peer-box", isPeerBox)
			this.nodes.cells[cell.index]!.part.toggle("peer", isPeerCol || isPeerRow || isPeerBox)

			this.nodes.cells[cell.index]!.part.toggle("invalid", cell.proposal > 0 && cell.proposal !== cell.solution)
			this.nodes.cells[cell.index]!.part.toggle("solved", cell.proposal === cell.solution)

			this.nodes.undo.part.toggle("disabled", this.history.index === 0)
			this.nodes.redo.part.toggle("disabled", this.history.index === this.history.length)

			if (this.nodes.texts[cell.index]!.data !== SudokuUI.getStringFromProposal(cell.proposal)) {
				this.nodes.texts[cell.index]!.data = SudokuUI.getStringFromProposal(cell.proposal)
			}
		}

		for (let digit: Digit = 1; digit <= LINE_SIZE; ++digit) {
			const isDigitSolved = digits[digit as Digit] === 0

			this.nodes.buttons[digit - 1]!.part.toggle("solved", isDigitSolved)

			if (!isDigitSolved) {
				this.#solved = false
			}
		}

		this.nodes.screen.part.toggle("complete", this.#solved)
		this.nodes.grid.part.toggle("complete", this.#solved)
		this.nodes.controls.part.toggle("complete", this.#solved)

		for (const button of this.nodes.buttons) {
			button.part.toggle("disabled", this.#solved)
		}

		this.nodes.undo.part.toggle("disabled", this.#solved)
		this.nodes.redo.part.toggle("disabled", this.#solved)
	}

	#handleGameReset = () => {
		this.game.reset()

		for (const cell of this.game) {
			this.nodes.texts[cell.index]!.data = SudokuUI.getStringFromProposal(cell.proposal)
			this.nodes.cells[cell.index]!.part.toggle("given", cell.proposal === cell.solution)
			this.nodes.cells[cell.index]!.part.toggle("focus-digit", cell.proposal === this.focused?.proposal)
		}

		this.#update()
	}

	#handleCellFocus = (event: Event) => {
		this.#focused = (event as CustomEvent).detail as number

		this.#update()
	}

	#handleInputDigit = (event: Event) => {
		const { focused } = this

		if (focused && event instanceof CustomEvent) {
			this.set(focused.index, event.detail)
		}

		if (this.#solved) {
			this.dispatchEvent(new CustomEvent("game:solved", { bubbles: true }))

			this.#focused = -1

			this.#update()
		}
	}

	#handleHistory = (event: Event) => {
		const { focused } = this

		if (focused && event instanceof CustomEvent) {
			if (event.detail === "undo") {
				this.undo()
			} else if (event.detail === "redo") {
				this.redo()
			}
		}
	}

	#set(cell: Sudoku.Cell, to: Proposal): void {
		cell.proposal = to

		this.#update()
	}

	set(index: number, to: Proposal): boolean {
		const cell = this.game[index]

		if (cell && !cell.given && cell.proposal !== to) {
			const from = cell.proposal

			this.history.add(index, from, to)

			this.#set(cell, to)

			return true
		}

		return false
	}

	undo(): boolean {
		const entry = this.history.undo()

		if (entry) {
			const cell = this.game[entry.index]

			if (cell) {
				this.#set(cell, entry.from)

				return true
			}
		}

		return false
	}

	redo(): boolean {
		const entry = this.history.redo()

		if (entry) {
			const cell = this.game[entry.index]

			if (cell) {
				this.#set(cell, entry.to)

				return true
			}
		}

		return false
	}

	static getStringFromProposal(proposal: Proposal) {
		return String(proposal || "")
	}
}

export const $assign = <T extends HTMLElement>(node: T, props: HTMLElementProps<T>): T => Object.assign(node, props)
export const $create = <T extends HTMLTagName>(name: T, props: HTMLTagProps<T>): HTMLTagNode<T> => $assign(document.createElement(name), props)

type HTMLElementProps<T extends HTMLElement> = Partial<Record<keyof T, unknown>>
type HTMLTagName = keyof HTMLElementTagNameMap
type HTMLTagNode<T extends HTMLTagName> = HTMLElementTagNameMap[T]
type HTMLTagProps<T extends HTMLTagName> = HTMLElementProps<HTMLTagNode<T>>
