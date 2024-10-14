import { memo, useMemo, useState } from 'react'
import { type Connection } from '../domain/connection'
import { Upgrade, UpgradeType } from '../domain/upgrade'
import { getStatsFromActiveUpgrades } from '../domain/stats'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'

export const Stage = memo(() => {
	const [redPoints, setRedPoints] = useState(0)
	const [upgrades, setUpgrades] = useState<Upgrade[]>([
		{
			id: 'A',
			type: UpgradeType.upgrade,
			tooltip: (stats) => 'Get +2 Power for every active Upgrade',
			cost: 10,
			effect: (stats, upgrade, upgrades) => ({
				...stats,
				usedPower: stats.usedPower + upgrade.cost,
				power:
					stats.power + upgrades.filter((u) => u.active).length * 2,
			}),
			active: false,
			icon: 'A',
			x: 1,
			y: 1,
		},
		{
			active: false,
			id: 'B1',
			type: UpgradeType.upgrade,
			tooltip: (stats) => '+30 Power',
			cost: 15,
			effect: (stats) => ({
				...stats,
				usedPower: stats.usedPower + 15,
				power: stats.power + 30,
			}),
			icon: 'B1',
			x: 1,
			y: 2,
		},
		{
			active: false,
			id: 'C',
			type: UpgradeType.upgrade,
			tooltip: (stats) => '+10 Power',
			cost: 2,
			effect: (stats) => ({
				...stats,
				usedPower: stats.usedPower + 2,
				power: stats.power + 10,
			}),
			icon: 'C',
			x: 2,
			y: 3,
		},
		{
			active: false,
			id: 'B2',
			type: UpgradeType.upgrade,
			tooltip: (stats) => '+ 5 Power',
			cost: 25,
			effect: (stats) => ({
				...stats,
				usedPower: stats.usedPower + 25,
				power: stats.power + 5,
			}),
			icon: 'B2',
			x: 3,
			y: 2,
		},
		{
			active: false,
			id: 'B3',
			type: UpgradeType.upgrade,
			tooltip: (stats) => '+ 5 Power',
			cost: 2,
			effect: (stats) => ({
				...stats,
				usedPower: stats.usedPower + 2,
				power: stats.power + 5,
			}),
			icon: 'B3',
			x: 2,
			y: 2,
		},
		{
			active: false,
			id: 'A2',
			type: UpgradeType.upgrade,
			tooltip: (stats) => 'Does nothing',
			cost: 8,
			effect: (stats, upgrade) => ({
				...stats,
				usedPower: stats.usedPower + upgrade.cost,
			}),
			icon: 'A2',
			x: 2,
			y: 1,
		},
		{
			active: true,
			id: 'M',
			type: UpgradeType.motor,
			tooltip: (stats) =>
				`Motor ${stats.usedPower}/${stats.power} (${Math.max(
					stats.power - stats.usedPower,
					0
				)} left)`,
			cost: 0,
			effect: (stats) => ({ ...stats, power: stats.power + 10 }),
			icon: 'M',
			x: 2,
			y: 4,
		},
	])
	const stats = useMemo(
		() => getStatsFromActiveUpgrades(upgrades),
		[upgrades]
	)

	const connections: Connection[] = [
		{
			id: crypto.randomUUID(),
			fromUpgradeId: 'M',
			toUpgradeId: 'C',
		},
		{
			id: crypto.randomUUID(),
			fromUpgradeId: 'C',
			toUpgradeId: 'B1',
		},
		{
			id: crypto.randomUUID(),
			fromUpgradeId: 'C',
			toUpgradeId: 'B2',
		},
		{
			id: crypto.randomUUID(),
			fromUpgradeId: 'B2',
			toUpgradeId: 'A2',
		},
		{
			id: crypto.randomUUID(),
			fromUpgradeId: 'B1',
			toUpgradeId: 'A',
		},
		{
			id: crypto.randomUUID(),
			fromUpgradeId: 'B2',
			toUpgradeId: 'B3',
		},
	]

	return (
		<>
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
		</>
	)
})
