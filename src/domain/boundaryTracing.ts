import { addPosition, closestToTopLeft, equalPosition, Position } from './main'

// Possible movement directions (8-directional)
const directions: Position[] = [
	{ x: 0, y: -1 }, // Up - 0
	{ x: 1, y: -1 }, // Up-Right - 1
	{ x: 1, y: 0 }, // Right - 2
	{ x: 1, y: 1 }, // Down-Right - 3
	{ x: 0, y: 1 }, // Down - 4
	{ x: -1, y: 1 }, // Down-Left - 5
	{ x: -1, y: 0 }, // Left - 6
	{ x: -1, y: -1 }, // Up-Left - 7
]

const OPPOSITE_DIRECTION = Math.round(directions.length / 2) // 4

type NeighborResult = { position: Position; direction: number }

export const getNextNeighbor = (
	grid: Position[],
	current: Position,
	lastDirection: number
): NeighborResult =>
	directions.reduce<NeighborResult | null>((result, _, i) => {
		if (result) return result
		const direction =
			(lastDirection + OPPOSITE_DIRECTION + 1 + i) % directions.length
		const newPosition = addPosition(current, directions[direction])
		return grid.some((p) => equalPosition(p, newPosition))
			? { position: newPosition, direction }
			: null
	}, null) ?? { position: current, direction: lastDirection }

export const traceBoundary = (
	grid: Position[],
	startPoint: Position,
	currentPoint: Position = startPoint,
	currentDirection: number = 0,
	boundary: NeighborResult[] = []
): NeighborResult[] => {
	const { direction, position } = getNextNeighbor(
		grid,
		currentPoint,
		currentDirection
	)

	const newBoundary = [...boundary, { position: currentPoint, direction }]

	if (
		equalPosition(position, startPoint) ||
		boundary.some((p) => equalPosition(p.position, position))
	)
		return newBoundary

	return traceBoundary(grid, startPoint, position, direction, newBoundary)
}

export const getBoundaryPath = (grid: Position[]) => {
	const startPoint = closestToTopLeft(grid)
	const boundary = traceBoundary(grid, startPoint)
	return boundary.flatMap((neighbor, index, neighbors) => {
		const nextNeighbor = neighbors[index + 1] ?? neighbors[0]
		const steps = Math.abs(neighbor.direction - nextNeighbor.direction - 1)
		console.log(neighbor, steps)
		const x = [...Array(steps)].map((_, step) => step)
		return x
	})
}
