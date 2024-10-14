export type Identifier = {
	id: string
}

export type Position = {
	x: number
	y: number
}

export type Area = Position & {
	width: number
	height: number
}

export const closerToTopLeft = (a: Position, b: Position) => {
	const distanceA = a.x * a.x + a.y * a.y
	const distanceB = b.x * b.x + b.y * b.y
	return distanceA <= distanceB ? a : b
}

export const createArea = (a: Position, b: Position): Area => ({
	x: Math.min(a.x, b.x),
	y: Math.min(a.y, b.y),
	width: Math.abs(a.x - b.x),
	height: Math.abs(a.y - b.y),
})

export const equalPosition = (a: Position, b: Position) =>
	a.x == b.x && a.y == b.y

export const isACloserToTopLeftThanB = (a: Position, b: Position) =>
	equalPosition(closerToTopLeft(a, b), a)

export const lerp = (start: number, end: number, t: number) =>
	start * (1 - t) + end * t

export const lerpPosition = (start: Position, end: Position, t: number) => ({
	x: lerp(start.x, end.x, t),
	y: lerp(start.y, end.y, t),
})
