import { useGameContext } from '../contexts/GameContext'
import { Position } from '../core/position'

type UsePositionProps = {
	mouse: Position
}

export const usePosition = ({ mouse }: UsePositionProps) => {
	const { gridScale } = useGameContext()

	return {
		cell: {
			x: Math.floor(mouse.x / gridScale),
			y: Math.floor(mouse.y / gridScale),
		},
	}
}
