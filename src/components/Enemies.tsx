import { Dispatch, SetStateAction, useEffect } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { getDistance, lerpPosition } from '../domain/main'
import { Upgrade, UpgradeType } from '../domain/upgrade'
import { Enemy, findTarget, randomRange } from '../domain/enemy'

type EnemiesProps = {
	upgrades: Upgrade[]
	enemies: Enemy[]
	setEnemies: Dispatch<SetStateAction<Enemy[]>>
}

export const Enemies = ({ enemies, setEnemies, upgrades }: EnemiesProps) => {
	const { gridScale, deltaTime, tick } = useGameContext()

	useEffect(() => {
		setEnemies((enemies) => {
			const activeUpgrades = upgrades.filter(
				(upgrade) =>
					upgrade.active && upgrade.type == UpgradeType.upgrade
			)
			if (activeUpgrades.length && enemies.length < 2)
				return [
					{
						id: crypto.randomUUID(),
						x: -6,
						y: randomRange(-6, 6),
						target: findTarget(upgrades).id,
						speed: 0.006,
					},
					{
						id: crypto.randomUUID(),
						x: randomRange(-6, 6),
						y: -6,
						target: findTarget(upgrades).id,
						speed: 0.006,
					},
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
					className="absolute bg-green-400"
					key={enemy.id}
					style={{
						transform: 'translate(-50%, -50%)',
						width: `${gridScale / 4}px`,
						height: `${gridScale / 4}px`,
						left: `${enemy.x * gridScale + gridScale / 2}px`,
						top: `${enemy.y * gridScale + gridScale / 2}px`,
					}}
				></div>
			))}
		</div>
	)
}
