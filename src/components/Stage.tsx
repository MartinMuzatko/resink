import { memo, useMemo, useState } from 'react'
import { type Connection } from '../domain/connection'
import { Upgrade, UpgradeType, UpgradeEffect } from '../domain/upgrade'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'

export const Stage = memo(() => {
	const [upgrades, setUpgrades] = useState<Upgrade[]>([
		{
			id: 'A',
			type: UpgradeType.upgrade,
			tooltip: (stats) => 'meow',
			cost: 10,
			effect: (stats) => stats,
			active: false,
			icon: 'A',
			x: 1,
			y: 1,
		},
		{
			active: false,
			id: 'B1',
			type: UpgradeType.upgrade,
			tooltip: (stats) => '+30 Max Power',
			cost: 15,
			effect: (stats) => ({
				...stats,
				usedPower: stats.usedPower + 15,
				maxPower: stats.maxPower + 30,
			}),
			icon: 'B1',
			x: 1,
			y: 2,
		},
		{
			active: false,
			id: 'C',
			type: UpgradeType.upgrade,
			tooltip: (stats) => '+10 Max Power',
			cost: 2,
			effect: (stats) => ({
				...stats,
				usedPower: stats.usedPower + 2,
				maxPower: stats.maxPower + 10,
			}),
			icon: 'C',
			x: 2,
			y: 3,
		},
		{
			active: false,
			id: 'B2',
			type: UpgradeType.upgrade,
			tooltip: (stats) => '+ 5 Max Power',
			cost: 25,
			effect: (stats) => ({
				...stats,
				usedPower: stats.usedPower + 25,
				maxPower: stats.maxPower + 5,
			}),
			icon: 'B2',
			x: 3,
			y: 2,
		},
		{
			active: false,
			id: 'A2',
			type: UpgradeType.upgrade,
			tooltip: (stats) => 'meow',
			cost: 10,
			effect: (stats) => stats,
			icon: 'A2',
			x: 2,
			y: 1,
		},
		{
			active: true,
			id: 'M',
			type: UpgradeType.motor,
			tooltip: (stats) => `Motor ${stats.usedPower}/${stats.maxPower}`,
			cost: 0,
			effect: (stats) => ({ ...stats, maxPower: stats.maxPower + 10 }),
			icon: 'M',
			x: 2,
			y: 4,
		},
	])
	const stats = useMemo((): UpgradeEffect => {
		return upgrades
			.filter((node) => node.active)
			.reduce<UpgradeEffect>(
				(prev, cur) => ({
					maxPower: cur.effect(prev).maxPower,
					usedPower: cur.effect(prev).usedPower,
				}),
				{
					maxPower: 0,
					usedPower: 0,
				}
			)
	}, [upgrades])

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
						setUpgrades,
						stats,
						connections,
					}}
				/>
			))}
		</>
	)
})
