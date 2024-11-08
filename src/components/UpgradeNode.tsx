import { BsLightningChargeFill } from 'react-icons/bs'
import { Divider, Tooltip } from '@mantine/core'
import { Dispatch, SetStateAction, useCallback } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { Connection } from '../domain/connection'
import {
	getHealth,
	getMaxHealth,
	isUpgradeAffordable,
	toggleActivation,
	Upgrade,
} from '../domain/upgrade'
import { getCost, Stats } from '../domain/stats'
import { HealthBar } from './HealthBar'
import { StatsInfo } from './StatsInfo'
import { clamp } from '../domain/main'

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
	const { gridScale, tick } = useGameContext()
	const toggleUpgrade = useCallback(() => {
		setUpgrades((upgrades) =>
			toggleActivation(upgrade, upgrades, connections, stats)
		)
	}, [upgrade, stats, connections, setUpgrades])
	const isAffordable = isUpgradeAffordable(
		upgrade,
		upgrades,
		connections,
		stats
	)
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
			{upgrade.active && stats.upgradeBulletAttackDamage !== 0 && (
				<div
					className="rounded-full absolute z-10 bg-red-900/10"
					style={{
						width: `${
							stats.upgradeBulletAttackRange * 2 * gridScale
						}px`,
						height: `${
							stats.upgradeBulletAttackRange * 2 * gridScale
						}px`,
					}}
				/>
			)}
			<Tooltip
				className="p-0"
				// {...(upgrade.type == UpgradeType.motor ? { opened: true } : {})}
				label={
					<>
						{(upgrade.title || upgrade.description) && (
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
							</>
						)}
						<div className="p-2">
							{upgrade.tooltip ? (
								upgrade.tooltip(stats, upgrade, upgrades)
							) : (
								<StatsInfo
									{...{
										stats,
										upgrade,
										upgrades,
									}}
								/>
							)}
							{upgrade.cost != 0 && (
								<div className="flex items-center">
									<div className="text-blue-600 mr-2">
										Cost
									</div>
									{getCost(stats, upgrade)}
									<BsLightningChargeFill className="ml-1" />
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
					className={`relative z-20 border-2 cursor-pointer flex text-center items-center justify-center hover:border-red-400 ${
						upgrade.active
							? 'bg-red-400 border-red-400'
							: isAffordable
							? 'bg-gray-800 border-red-200'
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
						{/* {upgrade.id} */}
						{upgrade.icon}
					</div>
					{upgrade.active && (
						<HealthBar
							current={getHealth(upgrade, stats)}
							max={getMaxHealth(upgrade, stats)}
						/>
					)}
					{upgrade.active &&
						stats.upgradeBulletAttackDamage !== 0 && (
							<div
								className="absolute top-0 left-full h-full bg-amber-800 z-20"
								style={{
									width: gridScale / 16,
								}}
							>
								<div
									className="absolute top-0 bg-amber-400 z-20"
									style={{
										width: gridScale / 16,
										height: `${
											clamp(
												0,
												1
											)(
												(tick -
													upgrade.lastBulletShotTime) /
													stats.upgradeBulletAttackSpeed
											) * 100
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
