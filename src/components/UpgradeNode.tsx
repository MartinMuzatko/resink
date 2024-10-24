import { Divider, Tooltip } from '@mantine/core'
import { Dispatch, SetStateAction, useCallback } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { Connection } from '../domain/connection'
import {
	getHealth,
	getMaxHealth,
	toggleActivation,
	Upgrade,
} from '../domain/upgrade'
import { UpgradeType } from '../domain/upgrade'
import { getCost, getStatsFromActiveUpgrades, Stats } from '../domain/stats'
import { HealthBar } from './HealthBar'

type UpgradeNodeProps = {
	upgrade: Upgrade
	upgrades: Upgrade[]
	connections: Connection[]
	setUpgrades: Dispatch<SetStateAction<Upgrade[]>>
	stats: Stats
}

export const UpgradeNode = ({
	stats,
	upgrade,
	upgrades,
	setUpgrades,
	connections,
}: UpgradeNodeProps) => {
	const { gridScale } = useGameContext()
	const toggleUpgrade = useCallback(() => {
		setUpgrades((upgrades) =>
			toggleActivation(upgrade, upgrades, connections, stats)
		)
	}, [upgrade, stats])
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
				className="p-0"
				// {...(upgrade.type == UpgradeType.motor ? { opened: true } : {})}
				label={
					<>
						<div className="p-2">
							{upgrade.title}
							{upgrade.description && (
								<div className="text-xs italic">
									{upgrade.description}
								</div>
							)}
						</div>
						<Divider color="gray" />
						<div className="p-2">
							<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
								Global Stats
							</div>
							{upgrade.tooltip(stats, upgrade, upgrades)}
							{upgrade.cost != 0 && (
								<div className="text-blue-600">
									Cost {getCost(stats, upgrade)} ©
								</div>
							)}
						</div>
						<Divider color="gray" my={4} />
						<div className="p-2 pt-0">
							❤️ {getHealth(upgrade, stats)} /{' '}
							{getMaxHealth(upgrade, stats)}
						</div>
					</>
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
					onClick={toggleUpgrade}
					// onMouseEnter={}
					className={`relative border-2 cursor-pointer flex text-center items-center justify-center hover:border-red-400 ${
						upgrade.active
							? 'bg-red-400 border-red-400'
							: 'bg-gray-800 border-red-900'
					}`}
					style={{
						width: `${gridScale / 2}px`,
						height: `${gridScale / 2}px`,
					}}
				>
					<div
						className="w-full h-full"
						style={{ padding: gridScale / 24 }}
					>
						{/* For debugging purposes when connecting */}
						{/* upgrade.id */}
						{upgrade.icon}
					</div>
					{upgrade.active && (
						<HealthBar
							current={getHealth(upgrade, stats)}
							max={getMaxHealth(upgrade, stats)}
						/>
					)}
				</div>
			</Tooltip>
		</div>
	)
}
