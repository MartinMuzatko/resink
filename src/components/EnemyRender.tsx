import { useGameContext } from '../contexts/GameContext'
import { Enemy } from '../domain/enemy'
import { HealthBar } from './HealthBar'

type EnemiesProps = {
	enemy: Enemy
}

export const EnemyRender = ({ enemy }: EnemiesProps) => {
	const { gridScale } = useGameContext()

	return (
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
	)
}
