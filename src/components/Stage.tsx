import { memo, useEffect, useMemo, useState } from 'react'
import { type Connection } from '../domain/connection'
import { updateUpgradeDamage, Upgrade, UpgradeType } from '../domain/upgrade'
import { getStatsFromActiveUpgrades } from '../domain/stats'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'
import { useGameContext } from '../contexts/GameContext'
import {
	Area,
	clamp,
	equalPosition,
	isPositionInsideArea,
	Position,
} from '../domain/main'
import { Enemies } from './Enemies'
import { Enemy } from '../domain/enemy'
import { useMouse } from '@mantine/hooks'
import { HealthBar } from './HealthBar'
import { INITIAL_CONNECTIONS, INITIAL_UPGRADES } from '../data/initialGameData'

const enemyStats = {
	damage: 1,
	speed: 1000,
}

const getGridPositionFromWindow = (
	windowPosition: Position,
	window: Window,
	gridScale: number
): Position => ({
	x: (windowPosition.x - window.innerWidth / 2 - gridScale / 2) / gridScale,
	y: (windowPosition.y - window.innerHeight / 2 - gridScale / 2) / gridScale,
})

type AttackArea = Area & {
	damage: number
	mouseAttackLastDamageDealtTime: number
}

export const Stage = memo(() => {
	const { tick, timePassed, gridScale } = useGameContext()
	const [totalEnemiesDefeated, setTotalEnemiesDefeated] = useState(0)
	const [powerThroughEnemiesDefeated, setPowerThroughEnemiesDefeated] =
		useState(0)
	const [enemies, setEnemies] = useState<Enemy[]>([])
	const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES())
	const connections: Connection[] = useMemo(() => INITIAL_CONNECTIONS, [])
	const stats = useMemo(
		() => getStatsFromActiveUpgrades(upgrades, powerThroughEnemiesDefeated),
		[upgrades, powerThroughEnemiesDefeated]
	)
	const mouse = useMouse()
	const gridMouse = useMemo(
		() => getGridPositionFromWindow(mouse, window, gridScale),
		[mouse]
	)

	const mouseAttackLastDamageDealtTime = useMemo(
		() => timePassed - (timePassed % stats.mouseAttackSpeed),
		[tick]
	)

	useEffect(() => {
		setEnemies((prevEnemies) => {
			const enemiesLeft = prevEnemies
				.map((enemy) =>
					isPositionInsideArea(enemy, attackArea)
						? {
								...enemy,
								health: enemy.health - stats.mouseDamage,
						  }
						: enemy
				)
				.filter((enemy) => enemy.health > 0)
			setPowerThroughEnemiesDefeated((prevPower) => {
				const enemiesKilled = prevEnemies.length - enemiesLeft.length
				// XXX: Calculated gain is based on power - usedPower (difference to max)
				// e.g. [-----++   ] (5/10) - 5 power (+2 enemies), 0 used, 10 max
				const maxGainAllowed = Math.max(
					0,
					prevPower + enemiesKilled + stats.power - stats.usedPower
				)
				return clamp(0, maxGainAllowed)(prevPower + enemiesKilled)
			})
			setTotalEnemiesDefeated(
				(totalEnemiesDefeated) =>
					totalEnemiesDefeated +
					prevEnemies.length -
					enemiesLeft.length
			)
			return enemiesLeft
		})
	}, [mouseAttackLastDamageDealtTime])

	const attackArea = useMemo((): AttackArea => {
		const center = getGridPositionFromWindow(mouse, window, gridScale)
		const size = stats.mouseSize
		return {
			x: center.x - size / 2,
			y: center.y - size / 2,
			width: size,
			height: size,
			damage: stats.mouseDamage,
			mouseAttackLastDamageDealtTime,
		}
	}, [mouse, mouseAttackLastDamageDealtTime])

	// Reset game when motor life is 0
	useEffect(() => {
		const motor = upgrades.find((u) => u.type === UpgradeType.motor)!
		if (motor.health <= 0) {
			setUpgrades(INITIAL_UPGRADES())
			setEnemies([])
			setTotalEnemiesDefeated(0)
			setPowerThroughEnemiesDefeated(0)
		}
	}, [upgrades])

	// update upgrade health on enemy attack
	useEffect(() => {
		const upgradeIdsToTakeDamage = upgrades
			.filter((upgrade) =>
				enemies.find((enemy) => equalPosition(upgrade, enemy))
			)
			.map((upgrade) => upgrade.id)
		if (upgradeIdsToTakeDamage.length)
			setUpgrades((upgrades) =>
				updateUpgradeDamage(
					upgradeIdsToTakeDamage,
					upgrades,
					connections,
					timePassed,
					stats
				)
			)
	}, [tick])

	return (
		<div className="w-full h-full top-0 left-0 absolute" ref={mouse.ref}>
			<div
				className={`absolute ${
					mouseAttackLastDamageDealtTime > timePassed - 500
						? 'bg-orange-200/80'
						: 'bg-orange-400/50'
				}`}
				style={{
					top: `${
						attackArea.y * gridScale +
						window.innerHeight / 2 +
						gridScale / 2
					}px`,
					left: `${
						attackArea.x * gridScale +
						window.innerWidth / 2 +
						gridScale / 2
					}px`,
					width: `${attackArea.width * gridScale}px`,
					height: `${attackArea.height * gridScale}px`,
				}}
			>
				<HealthBar
					current={timePassed - mouseAttackLastDamageDealtTime}
					max={stats.mouseAttackSpeed}
				/>
				{/* {JSON.stringify(attackArea)} */}
			</div>
			<div className="absolute left-0 top-0">
				max: {stats.maxPower}
				<br />
				using: {stats.usedPower}
				<br />
				generating: {stats.power}
				<br />
				powerThroughEnemies: {powerThroughEnemiesDefeated}
				<br />
				{mouse.x - window.innerWidth / 2 - gridScale / 2},
				{mouse.y - window.innerHeight / 2 - gridScale / 2}
				<br />
				{gridMouse.x.toFixed(0)},{gridMouse.y.toFixed(0)}
				<br />
			</div>
			<div className="absolute left-0 bottom-12">
				attacktime: {(timePassed / 1000).toFixed(0)}
				<br />
				last attack: {mouseAttackLastDamageDealtTime / 1000}
			</div>
			<div
				className="w-full h-full absolute left-0 top-0"
				style={{
					transform: 'translate(50%, 50%)',
				}}
			>
				{connections.map((connection) => (
					<ConnectionLine
						key={connection.id}
						{...{ connection, upgrades, stats }}
					/>
				))}
				{upgrades.map((upgrade) => (
					<UpgradeNode
						key={upgrade.id}
						{...{
							upgrade,
							upgrades,
							setUpgrades,
							stats,
							connections,
						}}
					/>
				))}
				<div
					className="absolute border-2 bg-gray-800 border-red-900"
					style={{
						width: 1 * gridScale - gridScale / 2,
						height: 2 * gridScale - gridScale / 2,
						top: `${2 * gridScale + gridScale / 4}px`,
						left: `${-2 * gridScale + gridScale / 4}px`,
					}}
				>
					<div className="font-bold font-mono absolute -rotate-90 origin-top-left top-10 -left-6">
						Power
					</div>

					<div
						className="absolute w-full bottom-0 bg-amber-300"
						style={{
							height: `${
								((stats.power - stats.usedPower) /
									stats.maxPower) *
								100
							}%`,
						}}
					></div>
					<div className="font-bold font-mono absolute -rotate-90 origin-top-left left-6 top-10">
						{stats.power - stats.usedPower}/{stats.maxPower}
					</div>
				</div>
			</div>
			<Enemies
				{...{
					attackArea,
					upgrades,
					enemies,
					setEnemies,
				}}
			/>
		</div>
	)
})
