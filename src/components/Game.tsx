import { useCallback, useEffect, useRef, useState } from 'react'
import { GameContext } from '../contexts/GameContext'

const speed = 50
const gridScale = 64

type Identifier = {
	id: string
}

type UpgradeNode = Identifier & {
	active: boolean
	x: number
	y: number
	icon: string
}

type Connection = Identifier & {
	fromUpgradeNode: string
	toUpgradeNode: string
}

type UpgradeNodeProps = UpgradeNode

const UpgradeNode = (props: UpgradeNodeProps) => {
	return (
		<div
			className="absolute flex items-center justify-center"
			style={{
				left: `${props.x * gridScale}px`,
				top: `${props.y * gridScale}px`,
				width: `${gridScale}px`,
				height: `${gridScale}px`,
			}}
		>
			<div
				className={`border-2 border-red-400 flex text-center items-center justify-center ${
					props.active ? 'bg-red-400' : ''
				}`}
				style={{
					width: `${gridScale / 2}px`,
					height: `${gridScale / 2}px`,
				}}
			>
				{props.icon}
			</div>
		</div>
	)
}

export const Game = () => {
	const lastUpdateTimeRef = useRef(0)
	const progressTimeRef = useRef(0)
	const deltaTime = useRef(0)
	const deltaTimes = useRef<number[]>([])
	const [isRunning, setIsRunning] = useState(true)
	const [tick, setTick] = useState(0)
	const requestRef = useRef<number>()
	const update = useCallback(
		(time: number) => {
			requestRef.current = requestAnimationFrame(update)
			if (!isRunning) return
			if (!lastUpdateTimeRef.current) {
				lastUpdateTimeRef.current = time
			}
			deltaTime.current = time - lastUpdateTimeRef.current
			deltaTimes.current.unshift(deltaTime.current)
			deltaTimes.current = deltaTimes.current.slice(0, 20)
			progressTimeRef.current += deltaTime.current
			if (progressTimeRef.current > speed) {
				setTick((a) => a + 1)
				progressTimeRef.current = 0
			}
			lastUpdateTimeRef.current = time
		},
		[isRunning]
	)

	useEffect(() => {
		requestRef.current = requestAnimationFrame(update)
		return () => {
			requestRef.current && cancelAnimationFrame(requestRef.current)
		}
	}, [isRunning, update])

	const upgradeNodes: UpgradeNode[] = [
		{
			active: false,
			icon: 'A',
			id: crypto.randomUUID(),
			x: 1,
			y: 1,
		},
		{
			active: false,
			icon: 'B',
			id: crypto.randomUUID(),
			x: 1,
			y: 2,
		},
	]

	return (
		<>
			<GameContext.Provider
				value={{ tick, isRunning, setIsRunning, gridScale }}
			>
				{tick}
				{upgradeNodes.map((upgradeNode) => (
					<UpgradeNode key={upgradeNode.id} {...upgradeNode} />
				))}
			</GameContext.Provider>
		</>
	)
}
