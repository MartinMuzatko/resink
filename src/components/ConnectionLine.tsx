import { useGameContext } from '../contexts/GameContext'
import { isACloserToTopLeftThanB, createArea } from '../domain/main'
import { type Connection } from '../domain/connection'
import { isUpgradeAffordable, Upgrade } from '../domain/upgrade'
import { Stats } from '../domain/stats'

type ConnectionProps = {
	connection: Connection
	upgrades: Upgrade[]
	stats: Stats
	power: number
}

export const ConnectionLine = ({
	upgrades,
	connection,
	stats,
	power,
}: ConnectionProps) => {
	const { gridScale } = useGameContext()
	const from = upgrades.find(
		(upgrade) => upgrade.id == connection.fromUpgradeId
	)
	const to = upgrades.find((upgrade) => upgrade.id == connection.toUpgradeId)
	if (!from || !to) return null

	// Order the points based on closeness to the top-left
	const [start, end] = isACloserToTopLeftThanB(from, to)
		? [from, to]
		: [to, from]

	const active = from.active && to.active
	const isAffordable = isUpgradeAffordable(
		to,
		upgrades,
		[connection],
		stats,
		power
	)

	const strokeWidth = gridScale / 24

	// Create the bounding box area for the line
	const { height, width, x: minX, y: minY } = createArea(start, end)

	return (
		<svg
			width={Math.max(strokeWidth, width * gridScale)}
			height={Math.max(strokeWidth, height * gridScale)}
			className="absolute"
			style={{
				top:
					minY * gridScale +
					gridScale / 2 -
					strokeWidth / 2 -
					gridScale / 2 +
					gridScale / 8,
				left:
					minX * gridScale +
					gridScale / 2 -
					strokeWidth / 2 -
					gridScale / 2 +
					gridScale / 8,
			}}
		>
			<line
				className={
					active
						? 'stroke-red-400'
						: isAffordable
						? 'stroke-red-200'
						: 'stroke-red-900'
				}
				x1={(start.x - minX) * gridScale + strokeWidth / 2}
				y1={(start.y - minY) * gridScale + strokeWidth / 2}
				x2={(end.x - minX) * gridScale + strokeWidth / 2}
				y2={(end.y - minY) * gridScale + strokeWidth / 2}
				strokeWidth={strokeWidth}
				// strokeDasharray={active ? '0' : '3 4'}
			/>
		</svg>
	)
}
