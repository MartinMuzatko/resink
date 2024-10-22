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

export const isPositionInsideArea = (position: Position, area: Area): boolean =>
	position.x >= area.x &&
	position.x <= area.x + area.width &&
	position.y >= area.y &&
	position.y <= area.y + area.height

export const generateRandomPositionOnEdge = (area: Area): Position => {
	const areaLeft = area.x
	const areaRight = area.x + area.width
	const areaTop = area.y
	const areaBottom = area.y + area.height

	const edge = Math.floor(Math.random() * 4)

	if (edge === 0) {
		// Left edge
		return {
			x: areaLeft,
			y: Math.random() * (areaBottom - areaTop) + areaTop,
		}
	}

	if (edge === 1) {
		// Right edge
		return {
			x: areaRight,
			y: Math.random() * (areaBottom - areaTop) + areaTop,
		}
	}

	if (edge === 2) {
		// Top edge
		return {
			x: Math.random() * (areaRight - areaLeft) + areaLeft,
			y: areaTop,
		}
	}

	// Bottom edge
	return {
		x: Math.random() * (areaRight - areaLeft) + areaLeft,
		y: areaBottom,
	}
}

export const lerp = (start: number, end: number, t: number) =>
	start * (1 - t) + end * t

export const lerpPosition = (start: Position, end: Position, t: number) =>
	getDistance(start, end) < 0.05
		? end
		: {
				x: lerp(start.x, end.x, t),
				y: lerp(start.y, end.y, t),
		  }

export const getDistance = (a: Point, b: Point) =>
	Math.hypot(a.x - b.x, a.y - b.y)

export const clamp = (min: number, max: number) => (n: number) =>
	Math.min(Math.max(n, min), max)

// 1 / ((distance / (experience.speed * delta)))
