import { $create, SudokuUI } from "./sudoku-ui.ts"

export class SudokuGameElement extends HTMLElement {
	internals = this.attachInternals()

	shadowRoot = this.attachShadow({
		mode: "open",
	})

	ui: SudokuUI

	constructor() {
		super()

		this.ui = new SudokuUI({ min: 36, max: 50 })

		this.shadowRoot.adoptedStyleSheets.push(defaultStyleOfSudokuGameElement)

		const solvedSlot = $create("slot", { name: "solved-message", part: "solved-message unsolved" })

		this.shadowRoot.append(this.ui.nodes.screen, solvedSlot)

		this.ui.addEventListener("game:reset", () => {
			this.dispatchEvent(new Event("game:reset"))

			this.internals.states.delete("solved")

			solvedSlot.part.add("unsolved")
		})

		this.ui.addEventListener("game:solved", () => {
			this.dispatchEvent(new Event("game:solved"))

			this.internals.states.add("solved")

			solvedSlot.part.remove("unsolved")
		})
	}
}

const defaultStyleOfSudokuGameElement = new CSSStyleSheet()

defaultStyleOfSudokuGameElement.replaceSync(
	"button{all:unset}div{all:unset}:host::part(solved-message unsolved){display:none}:host::part(screen){display: grid;-webkit-user-select:none;user-select:none}:host::part(grid){display:inline-grid;grid-template-columns:repeat(9,auto);grid-template-rows:repeat(9,auto)}:host::part(controls){display:inline-grid;grid-template-columns:repeat(3,auto);grid-template-rows:repeat(4,auto)}",
)
