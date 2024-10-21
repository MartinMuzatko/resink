import { Tooltip } from '@mantine/core'
import { Dispatch, SetStateAction, useCallback } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { Connection } from '../domain/connection'
import { getHealth, toggleActivation, Upgrade } from '../domain/upgrade'
import { UpgradeType } from '../domain/upgrade'
import { getCost, getStatsFromActiveUpgrades, Stats } from '../domain/stats'

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
				// {...(upgrade.type == UpgradeType.motor ? { opened: true } : {})}
				label={
					<div>
						{upgrade.tooltip(stats, upgrade, upgrades)}
						{upgrade.cost != 0 && (
							<div>
								{getCost(
									getStatsFromActiveUpgrades(upgrades),
									upgrade
								)}{' '}
								©
							</div>
						)}
						<div>
							Health: {getHealth(upgrade, stats)} / {stats.health}
						</div>
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
					{upgrade.icon}
					{upgrade.active && (
						<div
							className="absolute top-full w-full bg-green-800 z-20"
							style={{
								height: gridScale / 16,
							}}
						>
							<div
								className="absolute top-0 bg-green-400 z-20"
								style={{
									height: gridScale / 16,
									width: `${
										(getHealth(upgrade, stats) /
											stats.health) *
										100
									}%`,
								}}
							></div>
						</div>
					)}
				</div>
			</Tooltip>
		</div>
	)
}
