interface Position {
	x: number
	y: number
}

// Possible movement directions (8-directional)
const directions: Position[] = [
	{ x: 0, y: 1 }, // Right
	{ x: 1, y: 1 }, // Down-Right
	{ x: 1, y: 0 }, // Down
	{ x: 1, y: -1 }, // Down-Left
	{ x: 0, y: -1 }, // Left
	{ x: -1, y: -1 }, // Up-Left
	{ x: -1, y: 0 }, // Up
	{ x: -1, y: 1 }, // Up-Right
]

// Check if a position is within the provided set of positions
const isValidPosition = (pos: Position, positions: Set<string>): boolean =>
	positions.has(`${pos.x},${pos.y}`)

// Create a set of position strings for efficient lookup
const createPositionSet = (positions: Position[]): Set<string> =>
	new Set(positions.map((p) => `${p.x},${p.y}`))

// Add two positions together
const addPositions = (a: Position, b: Position): Position => ({
	x: a.x + b.x,
	y: a.y + b.y,
})

// Trace the boundary of a given set of positions
const traceBoundary = (positions: Position[]): Position[] => {
	if (positions.length === 0) return []

	const positionSet = createPositionSet(positions)
	const boundary: Position[] = []
	let currentPos: Position | null = null
	let startPos: Position | null = null

	// Find the starting position (leftmost, topmost)
	for (const pos of positions) {
		if (
			startPos === null ||
			pos.x < startPos.x ||
			(pos.x === startPos.x && pos.y < startPos.y)
		) {
			startPos = pos
		}
	}

	currentPos = startPos
	let currentDir = 0

	// Mark the first point as visited
	boundary.push(currentPos)

	const tracePath = () => {
		for (let i = 0; i < directions.length; i++) {
			const tryDir = (currentDir + i) % 8
			const nextPos = addPositions(currentPos!, directions[tryDir])

			if (isValidPosition(nextPos, positionSet)) {
				currentPos = nextPos
				currentDir = (tryDir + 6) % 8 // Rotate counterclockwise
				boundary.push(currentPos)
				return true
			}
		}
		return false
	}

	// Continue tracing until we return to the start
	while (
		currentPos &&
		(currentPos.x !== startPos.x || currentPos.y !== startPos.y)
	) {
		if (!tracePath()) break
	}

	return boundary
}

// Example usage
const input: Position[] = [
	{ x: 0, y: 0 },
	{ x: 0, y: 2 },
	{ x: 1, y: 1 },
	{ x: 1, y: 0 },
]

const trace = traceBoundary(input)
// Example usage
// const input: Position[] = [
// 	{ x: 0, y: 0 },
// 	{ x: 0, y: 2 },
// 	{ x: 1, y: 1 },
// 	{ x: 1, y: 0 },
// ]

// const trace = traceBoundary(input)
// const trace: Position[] = [
// 	{ x: 0, y: 0 },
// 	{ x: 2, y: 0 },
// 	{ x: 2, y: 2 },
// 	{ x: 1, y: 2 },
// 	{ x: 1, y: 3 },
// 	{ x: 0, y: 3 },
// 	{ x: 0, y: 2 },
// 	{ x: 1, y: 2 },
// 	{ x: 1, y: 1 },
// 	{ x: 0, y: 1 },
// 	{ x: 0, y: 0 },
// ]
console.log(trace)

const gridScale = 64

export const Example = () => {
	return (
		<div className="w-full h-full top-0 left-0 absolute m-8">
			{input.map((i) => (
				<div
					style={{
						position: 'absolute',
						width: gridScale,
						height: gridScale,
						left: i.x * gridScale,
						top: i.y * gridScale,
						backgroundColor: 'red',
					}}
				></div>
			))}
			<svg
				width="600"
				height="600"
				xmlns="http://www.w3.org/2000/svg"
				className="relative z-50"
			>
				<path
					d={`M ${trace
						.map((a) => `${a.x * gridScale} ${a.y * gridScale}`)
						.join(' L ')}`}
					style={{
						stroke: '#00FF00',
						strokeWidth: 3,
					}}
					fill="transparent"
				/>
			</svg>
		</div>
	)
}
