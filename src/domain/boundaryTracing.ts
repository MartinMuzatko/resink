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

type FreeDirection = {
	position: Position
	direction: number
}

type PartialNeighborResult = {
	position: Position | null
	direction: number | null
	freeDirections: FreeDirection[]
}

type NeighborResult = {
	position: Position
	direction: number
	freeDirections: FreeDirection[]
}

export const getNextNeighbor = (
	grid: Position[],
	current: Position,
	lastDirection: number
): NeighborResult => {
	const neighbors = directions.reduce<PartialNeighborResult>(
		(result, _, i) => {
			if (result.position) return result
			const direction =
				(lastDirection + OPPOSITE_DIRECTION + 1 + i) % directions.length
			const newPosition = addPosition(current, directions[direction])
			const positionOccupied = grid.some((p) =>
				equalPosition(p, newPosition)
			)
			const freeDirections = [
				...result.freeDirections,
				...(positionOccupied
					? []
					: [
							{
								direction,
								position: newPosition,
							},
					  ]),
			]
			return positionOccupied
				? { position: newPosition, direction, freeDirections }
				: { position: null, direction: null, freeDirections }
		},
		{
			position: null,
			direction: null,
			freeDirections: [],
		}
	)
	return neighbors.position === null
		? {
				position: current,
				direction: lastDirection,
				freeDirections: directions.map((v, direction) => ({
					direction,
					position: addPosition(current, v),
				})),
		  }
		: (neighbors as NeighborResult)
}

export const traceBoundary = (
	grid: Position[],
	startPoint: Position,
	currentPoint: Position = startPoint,
	currentDirection: number = 0,
	boundary: NeighborResult[] = []
): NeighborResult[] => {
	const { position, direction, freeDirections } = getNextNeighbor(
		grid,
		currentPoint,
		currentDirection
	)

	const newBoundary = [
		...boundary,
		{
			position: currentPoint,
			direction,
			freeDirections: freeDirections.filter(
				(direction) =>
					!boundary.find((b) =>
						b.freeDirections.find((f) =>
							equalPosition(direction.position, f.position)
						)
					)
			),
		},
	]

	if (
		equalPosition(position, startPoint) ||
		boundary.some((p) => equalPosition(p.position, position))
	) {
		const nextNeighbor = getNextNeighbor(grid, position, direction)
		return [
			...newBoundary.slice(1),
			{
				...nextNeighbor,
				freeDirections: nextNeighbor.freeDirections.filter(
					(direction) =>
						!boundary.find((b) =>
							b.freeDirections.find((f) =>
								equalPosition(direction.position, f.position)
							)
						)
				),
			},
		]
	}

	return traceBoundary(grid, startPoint, position, direction, newBoundary)
}

export const getBoundaryPath = (grid: Position[]) => {
	const startPoint = closestToTopLeft(grid)
	const boundary = traceBoundary(grid, startPoint)
	return boundary.flatMap((neighbor, index, neighbors) => {
		return neighbor.freeDirections.map((a) => ({
			line: a.position,
			pos: neighbor.position,
			dir: a.direction,
		}))
		// const nextNeighbor = neighbors[index + 1] ?? neighbors[0]
		// console.log(neighbor, steps)
		// const x = [...Array(steps)].map((_, step) => step)
		// return x
	})
}
