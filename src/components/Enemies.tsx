import { Dispatch, SetStateAction, useEffect, useMemo } from 'react'
import { useGameContext } from '../contexts/GameContext'
import {
	generateRandomPositionOnEdge,
	getDistance,
	lerpPosition,
} from '../domain/main'
import {
	findFurthestUpgradePosition,
	Upgrade,
	UpgradeType,
} from '../domain/upgrade'
import {
	Enemy,
	findTarget,
	getSpawnArea,
	moveEnemy,
	randomRange,
} from '../domain/enemy'
import { HealthBar } from './HealthBar'

type EnemiesProps = {
	upgrades: Upgrade[]
	enemies: Enemy[]
	setEnemies: Dispatch<SetStateAction<Enemy[]>>
}

export const Enemies = ({ enemies, setEnemies, upgrades }: EnemiesProps) => {
	const { gridScale, deltaTime, tick } = useGameContext()
	const spawnArea = useMemo(() => getSpawnArea(upgrades), [upgrades])

	useEffect(() => {
		setEnemies((enemies) => {
			const activeUpgrades = upgrades.filter(
				(upgrade) =>
					upgrade.active && upgrade.type == UpgradeType.upgrade
			)
			// TODO: Scale amount and toughness of enemies with time.
			// Also create varients
			if (activeUpgrades.length && enemies.length < 2)
				return [
					...enemies,
					...[...Array(Math.min(enemies.length + 8, 8))].map(() => ({
						id: crypto.randomUUID(),
						...generateRandomPositionOnEdge(spawnArea),
						target: findTarget(upgrades).id,
						speed: 0.0000003,
						health: 2,
					})),
				]
			return enemies.map((enemy) => moveEnemy(enemy, upgrades, deltaTime))
		})
	}, [tick])

	return (
		<div
			className="w-full h-full absolute top-0 left-0 pointer-events-none"
			style={{
				transform: 'translate(50%, 50%)',
			}}
		>
			{enemies.map((enemy) => (
				<div
					className="absolute bg-rose-600"
					key={enemy.id}
					style={{
						transform: 'translate(-50%, -50%)',
						width: `${gridScale / 4}px`,
						height: `${gridScale / 4}px`,
						left: `${enemy.x * gridScale + gridScale / 2}px`,
						top: `${enemy.y * gridScale + gridScale / 2}px`,
					}}
				>
					<HealthBar current={enemy.health} max={2} />
				</div>
			))}
		</div>
	)
}
