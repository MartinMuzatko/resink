import { useGameContext } from '../contexts/GameContext'
import { isACloserToTopLeftThanB, createArea } from '../domain/main'
import { type Connection } from '../domain/connection'
import { Upgrade } from '../domain/upgrade'

type ConnectionProps = {
	connection: Connection
	upgrades: Upgrade[]
}

export const ConnectionLine = (props: ConnectionProps) => {
	const { gridScale } = useGameContext()
	const from = props.upgrades.find(
		(upgrade) => upgrade.id == props.connection.fromUpgradeId
	)
	const to = props.upgrades.find(
		(upgrade) => upgrade.id == props.connection.toUpgradeId
	)
	if (!from || !to) return null

	// Order the points based on closeness to the top-left
	const [start, end] = isACloserToTopLeftThanB(from, to)
		? [from, to]
		: [to, from]

	const active = from.active && to.active
	const strokeWidth = gridScale / 24

	// Create the bounding box area for the line
	const { height, width, x: minX, y: minY } = createArea(start, end)

	return (
		<svg
			width={Math.max(strokeWidth, width * gridScale)}
			height={Math.max(strokeWidth, height * gridScale)}
			className="absolute"
			style={{
				top: minY * gridScale + gridScale / 2 - strokeWidth / 2,
				left: minX * gridScale + gridScale / 2 - strokeWidth / 2,
			}}
		>
			<line
				className={active ? 'stroke-red-400' : 'stroke-red-900'}
				x1={(start.x - minX) * gridScale + strokeWidth / 2}
				y1={(start.y - minY) * gridScale + strokeWidth / 2}
				x2={(end.x - minX) * gridScale + strokeWidth / 2}
				y2={(end.y - minY) * gridScale + strokeWidth / 2}
				strokeWidth={strokeWidth}
			/>
		</svg>
	)
}
