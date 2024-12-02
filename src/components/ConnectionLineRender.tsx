import { useGameContext } from '../contexts/GameContext'
import { createArea, isACloserToTopLeftThanB, Position } from '../domain/main'

type ConnectionLineRenderProps = {
	from: Position
	to: Position
	className?: string
}

export const ConnectionLineRender = ({
	from,
	to,
	className,
}: ConnectionLineRenderProps) => {
	const { gridScale } = useGameContext()
	const strokeWidth = gridScale / 24

	const [start, end] = isACloserToTopLeftThanB(from, to)
		? [from, to]
		: [to, from]
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
				className={className}
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
