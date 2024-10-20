import { memo, useEffect, useImperativeHandle, useMemo, useState } from 'react'
import { connection, type Connection } from '../domain/connection'
import { createUpgrade, Upgrade, UpgradeType } from '../domain/upgrade'
import { getCost, getStatsFromActiveUpgrades } from '../domain/stats'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'
import { useGameContext } from '../contexts/GameContext'
import {
	clamp,
	getDistance,
	Identifier,
	lerp,
	lerpPosition,
	Position,
} from '../domain/main'

export const Stage = memo(() => {
	const [redPoints, setRedPoints] = useState(0)
	const [upgrades, setUpgrades] = useState<Upgrade[]>([
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
				power:
					stats.power + upgrades.filter((u) => u.active).length * 2,
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
				power:
					stats.power + upgrades.filter((u) => u.active).length * 2,
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
				health: stats.health + 1,
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
				health: stats.health + 1,
			}),
			icon: 'U',
			x: 1,
			y: 0,
		}),
	])
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
					transform: `translate(50%, 50%)`,
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
			<Enemies upgrades={upgrades} />
		</div>
	)
})

type EnemiesProps = {
	upgrades: Upgrade[]
}

const randomRange = (min: number, max: number) =>
	Math.random() * (max - min) + min
const randomRangeInteger = (min: number, max: number) =>
	Math.round(randomRange(min, max))
const randomArrayItem = <T extends {}>(array: T[]) =>
	array[randomRangeInteger(0, array.length - 1)]

const findTarget = (upgrades: Upgrade[]) => {
	const activeUpgrades = upgrades.filter(
		(upgrade) => upgrade.active && upgrade.type == UpgradeType.upgrade
	)
	if (!activeUpgrades.length)
		return upgrades.find((upgrade) => upgrade.type == UpgradeType.motor)!
	return randomArrayItem(activeUpgrades)
}

type Enemy = Identifier &
	Position & {
		target: string
		speed: number
	}

const Enemies = (props: EnemiesProps) => {
	const { gridScale, deltaTime, tick } = useGameContext()
	const [enemies, setEnemies] = useState<Enemy[]>([])

	useEffect(() => {
		setEnemies((enemies) => {
			const activeUpgrades = props.upgrades.filter(
				(upgrade) =>
					upgrade.active && upgrade.type == UpgradeType.upgrade
			)
			if (activeUpgrades.length && enemies.length < 2)
				return [
					{
						id: crypto.randomUUID(),
						x: -6,
						y: randomRange(-6, 6),
						target: findTarget(props.upgrades).id,
						speed: 0.006,
					},
					{
						id: crypto.randomUUID(),
						x: randomRange(-6, 6),
						y: -6,
						target: findTarget(props.upgrades).id,
						speed: 0.006,
					},
				]
			// return enemies
			return enemies.map((enemy) => {
				const currentTarget = props.upgrades.find(
					(u) => u.id == enemy.target
				)!
				const target = currentTarget.active
					? currentTarget
					: findTarget(props.upgrades)
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
				transform: `translate(50%, 50%)`,
			}}
		>
			{enemies.map((enemy) => (
				<div
					className="absolute bg-green-400"
					key={enemy.id}
					style={{
						transform: `translate(-50%, -50%)`,
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
