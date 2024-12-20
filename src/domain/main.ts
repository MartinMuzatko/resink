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

export const closestToTopLeft = (positions: Position[]): Position =>
	positions.reduce(
		(closest, current) =>
			closest === null || current.x + current.y < closest.x + closest.y
				? current
				: closest,
		null as Position | null
	) ?? positions[0]

export const createArea = (a: Position, b: Position): Area => ({
	x: Math.min(a.x, b.x),
	y: Math.min(a.y, b.y),
	width: Math.abs(a.x - b.x),
	height: Math.abs(a.y - b.y),
})

export const equalPosition = (a: Position, b: Position) =>
	a.x == b.x && a.y == b.y

export const addPosition = (a: Position, b: Position) => ({
	x: a.x + b.x,
	y: a.y + b.y,
})

/** Subtracts `a` from `b` */
export const subPosition = (a: Position, b: Position) => ({
	x: b.x - a.x,
	y: b.y - a.y,
})

export const mulPosition = (a: Position, multiplier: number) => ({
	x: a.x * multiplier,
	y: a.y * multiplier,
})

export const isACloserToTopLeftThanB = (a: Position, b: Position) =>
	equalPosition(closerToTopLeft(a, b), a)

export const isPositionInsideArea = (position: Position, area: Area): boolean =>
	position.x >= area.x &&
	position.x <= area.x + area.width &&
	position.y >= area.y &&
	position.y <= area.y + area.height

export const doRectanglesIntersect = (a: Area, b: Area): boolean =>
	a.x < b.x + b.width &&
	a.x + a.width > b.x &&
	a.y < b.y + b.height &&
	a.y + a.height > b.y

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

export const multiLerp = (points: number[], t: number): number => {
	if (points.length < 2) return points[0]
	const i = Math.min(Math.floor(t * (points.length - 1)), points.length - 2)
	const localT = (t * (points.length - 1)) % 1
	return points[i] * (1 - localT) + points[i + 1] * localT
}

export const parabolicEase = (t: number): number => 4 * t * (1 - t)

export const lerpPosition = (start: Position, end: Position, t: number) =>
	getDistance(start, end) < 0.05
		? end
		: {
				x: lerp(start.x, end.x, t),
				y: lerp(start.y, end.y, t),
		  }

export const getDistance = (a: Position, b: Position) =>
	Math.hypot(a.x - b.x, a.y - b.y)

export const clamp = (min: number, max: number) => (n: number) =>
	Math.min(Math.max(n, min), max)

export const getSpeedVector = (
	start: Position,
	target: Position,
	speed: number
): Position => {
	const diff = subPosition(start, target)
	const distance = getDistance(start, target)
	if (distance === 0) return { x: 0, y: 0 }
	return {
		x: (diff.x / distance) * speed,
		y: (diff.y / distance) * speed,
	}
}

export const normalizeVector = (vector: Position) => {
	const length = Math.sqrt(vector.x ** 2 + vector.y ** 2)
	return length > 0
		? { x: vector.x / length, y: vector.y / length }
		: { x: 0, y: 0 }
}

export const getVectorAngleDegrees = (vector: Position): number => {
	const angleRadians = Math.atan2(vector.y, vector.x)
	return ((angleRadians * 180) / Math.PI + 360) % 360
}

export const randomRange = (min: number, max: number) =>
	Math.random() * (max - min) + min

export const randomRangeInteger = (min: number, max: number) =>
	Math.round(randomRange(min, max))

export const randomArrayItem = <T>(array: T[]) =>
	array[randomRangeInteger(0, array.length - 1)]
