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
import { Enemy, findTarget, randomRange } from '../domain/enemy'
import { HealthBar } from './HealthBar'

type EnemiesProps = {
	upgrades: Upgrade[]
	enemies: Enemy[]
	setEnemies: Dispatch<SetStateAction<Enemy[]>>
}

export const Enemies = ({ enemies, setEnemies, upgrades }: EnemiesProps) => {
	const { gridScale, deltaTime, tick } = useGameContext()
	const spawnArea = useMemo(() => {
		const furthestPosition = findFurthestUpgradePosition(upgrades)
		const x = Math.abs(furthestPosition.x)
		const y = Math.abs(furthestPosition.y)
		const size = Math.max(x, y) + 2
		return {
			x: size * -1,
			y: size * -1,
			width: size * 2,
			height: size * 2,
		}
	}, [upgrades])

	useEffect(() => {
		setEnemies((enemies) => {
			const activeUpgrades = upgrades.filter(
				(upgrade) =>
					upgrade.active && upgrade.type == UpgradeType.upgrade
			)
			if (activeUpgrades.length && enemies.length < 2)
				return [
					...enemies,
					...[...Array(Math.min(enemies.length + 5, 5))].map(() => ({
						id: crypto.randomUUID(),
						// TODO: generate area based on outmost active node
						...generateRandomPositionOnEdge(spawnArea),
						target: findTarget(upgrades).id,
						speed: 0.003,
						health: 2,
					})),
				]
			// return enemies
			return enemies.map((enemy) => {
				const currentTarget = upgrades.find(
					(u) => u.id == enemy.target
				)!
				const target = currentTarget.active
					? currentTarget
					: findTarget(upgrades)
				const distance = getDistance(enemy, target)
				const p = lerpPosition(
					enemy,
					{
						x: target.x,
						y: target.y,
					},
					(enemy.speed * deltaTime) / distance
				)
				return {
					...enemy,
					...p,
					target: target.id,
				}
			})
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
