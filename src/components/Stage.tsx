import { memo, useEffect, useMemo, useState } from 'react'
import { connection, type Connection } from '../domain/connection'
import {
	createUpgrade,
	getHealth,
	Upgrade,
	UpgradeType,
} from '../domain/upgrade'
import { getCost, getStatsFromActiveUpgrades } from '../domain/stats'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'
import { useGameContext } from '../contexts/GameContext'
import {
	Area,
	equalPosition,
	isPositionInsideArea,
	Position,
} from '../domain/main'
import { Enemies } from './Enemies'
import { Enemy } from '../domain/enemy'
import { useMouse } from '@mantine/hooks'
import { HealthBar } from './HealthBar'

const INITIAL_UPGRADES = [
	createUpgrade({
		active: true,
		id: 'M',
		type: UpgradeType.motor,
		tooltip: (stats) =>
			`Motor ${stats.usedPower}/${stats.power} (${Math.max(
				stats.power - stats.usedPower,
				0
			)} left)`,
		effect: (stats) => ({ ...stats, power: stats.power + 10 }),
		icon: 'M',
		x: 0,
		y: 0,
	}),
	createUpgrade({
		id: 'A',
		tooltip: (stats) => '+1 Damage',
		cost: 5,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseDamage: stats.mouseDamage + 1,
		}),
		icon: 'A',
		x: 0,
		y: -1,
	}),
	createUpgrade({
		id: 'A1',
		tooltip: (stats) => '+10% Attack speed',
		cost: 10,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseAttackSpeed: stats.mouseAttackSpeed * 0.9,
		}),
		icon: 'A1',
		x: 0,
		y: -2,
	}),
	createUpgrade({
		id: 'AS2',
		tooltip: (stats) => '+20% Attack speed',
		cost: 20,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseAttackSpeed: stats.mouseAttackSpeed * 0.8,
		}),
		icon: 'AS2',
		x: 0,
		y: -3,
	}),
	createUpgrade({
		id: 'A2',
		tooltip: (stats) => '+2 Damage',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			power: stats.power + upgrades.filter((u) => u.active).length * 2,
		}),
		icon: 'A2',
		x: -1,
		y: -2,
	}),
	createUpgrade({
		id: 'A3',
		tooltip: (stats) => '+2 Damage',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			power: stats.power + upgrades.filter((u) => u.active).length * 2,
		}),
		icon: 'A3',
		x: 1,
		y: -2,
	}),
	createUpgrade({
		id: 'D',
		tooltip: (stats) => '+1 Health',
		cost: 4,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			health: stats.health + 1,
		}),
		icon: 'D',
		x: 0,
		y: 1,
	}),
	createUpgrade({
		id: 'L',
		tooltip: (stats) => '+1 Range',
		cost: 4,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			// health: stats.health + 1,
		}),
		icon: 'L',
		x: -1,
		y: 0,
	}),
	createUpgrade({
		id: 'U',
		tooltip: (stats) => '+1 Range',
		cost: 4,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			// health: stats.health + 1,
		}),
		icon: 'U',
		x: 1,
		y: 0,
	}),
]

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
	const [enemies, setEnemies] = useState<Enemy[]>([])
	const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES)
	const connections: Connection[] = useMemo(
		() => [
			connection('M', 'A'),
			connection('A', 'A1'),
			connection('A', 'A2'),
			connection('A', 'A3'),
			connection('A1', 'AS2'),
			connection('M', 'D'),
			connection('M', 'L'),
			connection('M', 'U'),
		],
		[]
	)
	const stats = useMemo(
		() => getStatsFromActiveUpgrades(upgrades, totalEnemiesDefeated),
		[upgrades, totalEnemiesDefeated]
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
		const size = 1
		return {
			x: center.x - size / 2,
			y: center.y - size / 2,
			width: size,
			height: size,
			damage: 1,
			mouseAttackLastDamageDealtTime,
		}
	}, [mouse, mouseAttackLastDamageDealtTime])

	// Reset game when motor life is 0
	useEffect(() => {
		const motor = upgrades.find((u) => u.type === UpgradeType.motor)!
		if (motor.health <= 0) {
			setUpgrades(INITIAL_UPGRADES)
			setEnemies([])
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
				upgrades.map((upgrade) =>
					upgradeIdsToTakeDamage.includes(upgrade.id) &&
					upgrade.lastTimeDamageTaken < timePassed - 1000
						? {
								...upgrade,
								health: getHealth(upgrade, stats) - 1,
								active: getHealth(upgrade, stats) > 0,
								lastTimeDamageTaken: timePassed,
						  }
						: upgrade
				)
			)
	}, [tick])

	return (
		<div className="w-full h-full top-0 left-0 absolute" ref={mouse.ref}>
			<div
				className={` absolute ${
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
				{stats.usedPower}/{stats.power} ({stats.power - stats.usedPower}{' '}
				left)
				<br />
				<br />
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
						{...{ connection, upgrades }}
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
