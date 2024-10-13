import { useCallback, useEffect, useRef, useState } from 'react'
import { GameContext } from '../contexts/GameContext'
import { Stage } from './Stage'

const speed = 50
const gridScale = 64

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

	return (
		<>
			<GameContext.Provider
				value={{ tick, isRunning, setIsRunning, gridScale }}
			>
				<Stage />
			</GameContext.Provider>
		</>
	)
}
