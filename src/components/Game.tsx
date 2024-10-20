import { ReactNode, useCallback, useEffect, useRef, useState } from 'react'
import { GameContext } from '../contexts/GameContext'
import { Stage } from './Stage'

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
			if (!isRunning) return
			if (!lastUpdatedTime.current) {
				lastUpdatedTime.current = time
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
					deltaTime: deltaTime.current ?? 0,
				}}
			>
				<br />
				time: {(timePassed.current / 1000).toFixed(0)}
				<br />
				fps:{' '}
				{(
					(1 /
						(deltaTimes.current.reduce((p, c) => p + c, 0) /
							deltaTimes.current.length)) *
					1000
				).toFixed(0)}
				{/* <PanZoom> */}
				<Stage />
				{/* </PanZoom> */}
			</GameContext.Provider>
		</>
	)
}

type PanZoomProps = { children: ReactNode }
const PanZoom = (props: PanZoomProps) => {
	const [isTranslating, setIsTranslating] = useState(false)
	const [translate, setTranslate] = useState([0, 0])
	return (
		<div
			style={{
				transform: `translate(${translate[0]}px, ${translate[1]}px)`,
			}}
			className="w-full h-full border border-red-400"
			onMouseDown={() => {
				setIsTranslating(true)
			}}
			onMouseUp={() => {
				setIsTranslating(false)
			}}
			onMouseMove={(event) => {
				if (!isTranslating) return
				setTranslate((translate) => [
					translate[0] + event.movementX,
					translate[1] + event.movementY,
				])
			}}
		>
			{props.children}
		</div>
	)
}
