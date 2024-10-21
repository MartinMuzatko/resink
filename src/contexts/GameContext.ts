import { createContext, useContext, Dispatch, SetStateAction } from 'react'

type GameContextType = {
	tick: number
	gridScale: number
	isRunning: boolean
	setIsRunning: Dispatch<SetStateAction<boolean>>
	deltaTime: number
	timePassed: number
}

export const GameContext = createContext<GameContextType>({
	deltaTime: 0,
	tick: 0,
	gridScale: 16,
	isRunning: false,
	timePassed: 0,
	setIsRunning: () => {},
})

export const useGameContext = () => useContext(GameContext)
