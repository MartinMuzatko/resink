import { useState } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { getConnectionNodePosition } from '../core/connectionNode'
import { Position, addPosition, scalePosition } from '../core/position'
import { ConnectionPoint, Packet } from '../core/connection'

type UseWireInteractionProps = {
	mouse: Position
}

export const useWireInteraction = ({ mouse }: UseWireInteractionProps) => {
	const [currentPackets, setCurrentPackets] = useState<Packet[]>([])
	const [currentWireOrigin, setCurrentWireOrigin] =
		useState<ConnectionPoint | null>(null)
	const { gridScale } = useGameContext()
	const [currentWireLength, setCurrentWireLength] = useState(0)

	if (!currentWireOrigin)
		return {
			mouse,
			currentWireStartPosition: { x: 0, y: 0 },
			currentWireEndPosition: { x: 0, y: 0 },
			currentWireLength: 0,
			setCurrentWireLength: 0,
			currentWireOrigin,
			setCurrentWireOrigin,
			currentPackets,
			setCurrentPackets,
		}

	const currentWireStartPosition = currentWireOrigin
		? addPosition(
				scalePosition(gridScale, currentWireOrigin.module),
				getConnectionNodePosition(
					gridScale,
					currentWireOrigin.connectionNode
				)
		  )
		: { x: 0, y: 0 }

	// const intermediateCurrentWireEndPosition = subPosition(mouse, {
	// 	x: gridScale / 22 / 8,
	// 	y: gridScale / 22 / 8,
	// })

	// TODO: depends on where the start is!
	const currentWireEndPosition = addPosition(mouse, {
		x: gridScale / 22,
		y: gridScale / 22,
	})
	return {
		mouse,
		currentWireStartPosition,
		currentWireEndPosition,
		currentWireLength,
		setCurrentWireLength,
		currentWireOrigin,
		setCurrentWireOrigin,
		currentPackets,
		setCurrentPackets,
	}
}
