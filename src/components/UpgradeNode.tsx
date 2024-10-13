import { Tooltip } from '@mantine/core'
import { Dispatch, SetStateAction } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { Connection } from '../domain/connection'
import { Upgrade } from '../domain/upgrade'
import {
	UpgradeEffect,
	UpgradeType,
	findParent,
	findChildren,
} from '../domain/upgrade'

type UpgradeNodeProps = {
	upgrade: Upgrade
	connections: Connection[]
	setUpgrades: Dispatch<SetStateAction<Upgrade[]>>
	stats: UpgradeEffect
}

export const UpgradeNode = ({
	stats,
	upgrade,
	setUpgrades,
	connections,
}: UpgradeNodeProps) => {
	const { gridScale } = useGameContext()
	return (
		<div
			className="absolute flex items-center justify-center"
			style={{
				left: `${upgrade.x * gridScale}px`,
				top: `${upgrade.y * gridScale}px`,
				width: `${gridScale}px`,
				height: `${gridScale}px`,
			}}
		>
			<Tooltip
				{...(upgrade.type == UpgradeType.motor ? { opened: true } : {})}
				label={
					<div>
						{upgrade.tooltip(stats)}
						{upgrade.cost != 0 && <div>{upgrade.cost} ©</div>}
					</div>
				}
				position="right-start"
				arrowPosition="side"
				arrowSize={gridScale / 8}
				withArrow
				classNames={{
					tooltip: 'bg-black',
				}}
			>
				<div
					onClick={() => {
						setUpgrades((upgrades) => {
							const parentUpgrade = findParent(
								upgrade,
								upgrades,
								connections
							)
							const childrenUpgrades = findChildren(
								upgrade,
								upgrades,
								connections
							)
							console.log(parentUpgrade)
							const canActivate =
								parentUpgrade?.active &&
								stats.usedPower + upgrade.cost <= stats.maxPower
							const upgradeIndex = upgrades.findIndex(
								(node) => node.id == upgrade.id
							)
							return upgrades.toSpliced(upgradeIndex, 1, {
								...upgrade,
								active: canActivate
									? !upgrade.active
									: upgrade.active,
							})
						})
					}}
					className={`border-2 cursor-pointer flex text-center items-center justify-center ${
						upgrade.active
							? 'bg-red-400 border-red-400'
							: 'bg-gray-800 border-red-900'
					}`}
					style={{
						width: `${gridScale / 2}px`,
						height: `${gridScale / 2}px`,
					}}
				>
					{upgrade.icon}
				</div>
			</Tooltip>
		</div>
	)
}
