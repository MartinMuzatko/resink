import { createContext, useContext, Dispatch, SetStateAction } from 'react'

type GameContextType = {
	tick: number
	gridScale: number
	isRunning: boolean
	setIsRunning: Dispatch<SetStateAction<boolean>>
}

export const GameContext = createContext<GameContextType>({
	tick: 0,
	gridScale: 16,
	isRunning: false,
	setIsRunning: () => { }
})

export const useGameContext = () => useContext(GameContext)
