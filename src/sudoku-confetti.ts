// @ts-ignore because this is an external import
import { create } from "https://cdn.jsdelivr.net/npm/canvas-confetti/dist/confetti.module.mjs"

export const createConfetti = (target: HTMLElement = document.documentElement) => {
	const confettiElement = target.appendChild(document.createElement("canvas"))

	const confettiObject = create(confettiElement, {
		resize: true,
		useWorker: true,
	})

	let confettiFrameEnd: number

	const onConfettiFrame = () => {
		if (Date.now() < confettiFrameEnd) {
			confettiFrame = requestAnimationFrame(onConfettiFrame)
		}

		confettiObject({
			particleCount: 2,
			angle: 60,
			spread: 55,
			origin: { x: 0 },
			colors: ["#bb0000", "#ffffff"],
		})

		confettiObject({
			particleCount: 2,
			angle: 120,
			spread: 55,
			origin: { x: 1 },
			colors: ["#bb0000", "#ffffff"],
		})
	}

	let confettiFrame = -1

	return {
		start() {
			confettiFrameEnd = Date.now() + 6e3

			onConfettiFrame()
		},
		stop() {
			cancelAnimationFrame(confettiFrame)
		},
	}
}
