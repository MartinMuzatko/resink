import { Dispatch, SetStateAction } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { Upgrade } from '../domain/upgrade'
import { Enemy } from '../domain/enemy'
import { HealthBar } from './HealthBar'

type EnemiesProps = {
	upgrades: Upgrade[]
	enemies: Enemy[]
	setEnemies: Dispatch<SetStateAction<Enemy[]>>
	wave: number
	setWave: Dispatch<SetStateAction<number>>
	waveStartedTime: number
	setWaveStartedTime: Dispatch<SetStateAction<number>>
}

export const Enemies = ({ enemies }: EnemiesProps) => {
	const { gridScale } = useGameContext()

	// const amountEnemies = 1

	return (
		<>
			{enemies.map((enemy) => (
				<div
					className="absolute bg-rose-600 z-30"
					key={enemy.id}
					style={{
						width: `${enemy.size * gridScale}px`,
						height: `${enemy.size * gridScale}px`,
						left: `${enemy.x * gridScale}px`,
						top: `${enemy.y * gridScale}px`,
					}}
				>
					<HealthBar current={enemy.health} max={enemy.maxHealth} />
				</div>
			))}
		</>
	)
}
