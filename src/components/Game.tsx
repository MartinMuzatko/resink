import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { GameContext } from '../contexts/GameContext'
import { Stage } from './Stage'
import { Button } from '@mantine/core'
import { match } from 'ts-pattern'

const speed = 50
const gridScale = 64

export const Game = () => {
	const lastUpdatedTime = useRef(0)
	const frameTimeProgress = useRef(0)
	const deltaTime = useRef(0)
	const timePassed = useRef(0)
	const deltaTimes = useRef<number[]>([])
	const [isRunning, setIsRunning] = useState(true)
	const [tick, setTick] = useState(0)
	const requestRef = useRef<number>()
	const update = useCallback(
		(time: number) => {
			requestRef.current = requestAnimationFrame(update)
			if (!lastUpdatedTime.current) {
				lastUpdatedTime.current = time
			}
			if (!isRunning) {
				lastUpdatedTime.current = time
				return
			}
			deltaTime.current = time - lastUpdatedTime.current
			deltaTimes.current.unshift(deltaTime.current)
			deltaTimes.current = deltaTimes.current.slice(0, 20)
			frameTimeProgress.current += deltaTime.current
			timePassed.current += deltaTime.current
			if (frameTimeProgress.current > speed) {
				setTick((a) => a + 1)
				frameTimeProgress.current = 0
			}
			lastUpdatedTime.current = time
		},
		[isRunning]
	)

	useEffect(() => {
		const keyHandler = (event: KeyboardEvent) => {
			match(event.key).with('Escape', () => {
				setIsRunning((isRunning) => !isRunning)
			})
		}
		document.addEventListener('keydown', keyHandler)
		return () => document.removeEventListener('keydown', keyHandler)
	}, [])

	useEffect(() => {
		requestRef.current = requestAnimationFrame(update)
		return () => {
			requestRef.current && cancelAnimationFrame(requestRef.current)
		}
	}, [isRunning, update])

	return (
		<>
			<GameContext.Provider
				value={{
					tick,
					isRunning,
					setIsRunning,
					gridScale,
					timePassed: timePassed.current,
					deltaTime: deltaTime.current ?? 0,
				}}
			>
				<div className="absolute bottom-0 left-0">
					<p>time: {(timePassed.current / 1000).toFixed(0)}</p>
					<p>
						fps:{' '}
						{(
							(1 /
								(deltaTimes.current.reduce((p, c) => p + c, 0) /
									deltaTimes.current.length)) *
							1000
						).toFixed(0)}
					</p>
					<p>tick: {tick}</p>
					<Button
						className="z-50"
						onClick={() => {
							setIsRunning((isRunning) => !isRunning)
						}}
					>
						{isRunning ? 'Pause' : 'Resume'}
					</Button>
				</div>
				<Stage />
			</GameContext.Provider>
		</>
	)
}
