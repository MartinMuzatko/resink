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
import { equalPosition } from '../domain/main'
import { Enemies } from './Enemies'
import { Enemy } from '../domain/enemy'

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
			damage: stats.damage + 1,
		}),
		icon: 'A',
		x: 0,
		y: -1,
	}),
	createUpgrade({
		id: 'A1',
		tooltip: (stats) => '+2 Damage',
		cost: 2,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			damage: stats.damage + 2,
		}),
		icon: 'A1',
		x: 0,
		y: -2,
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
		icon: 'A1',
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

export const Stage = memo(() => {
	const { tick, timePassed } = useGameContext()
	const [enemies, setEnemies] = useState<Enemy[]>([])
	const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES)
	const stats = useMemo(
		() => getStatsFromActiveUpgrades(upgrades),
		[upgrades]
	)

	const connections: Connection[] = useMemo(
		() => [
			connection('M', 'A'),
			connection('A', 'A1'),
			connection('A', 'A2'),
			connection('A', 'A3'),
			connection('M', 'D'),
			connection('M', 'L'),
			connection('M', 'U'),
		],
		[]
	)

	useEffect(() => {
		const motor = upgrades.find((u) => u.type === UpgradeType.motor)!
		if (motor.health <= 0) {
			setUpgrades(INITIAL_UPGRADES)
			setEnemies([])
		}
	}, [upgrades])

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
		<div className="w-full h-full">
			<div className="absolute left-0 top-0">
				{stats.usedPower}/{stats.power} ({stats.power - stats.usedPower}{' '}
				left)
				<br />
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
					upgrades,
					enemies,
					setEnemies,
				}}
			/>
		</div>
	)
})
