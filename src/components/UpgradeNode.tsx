import { BsLightningChargeFill } from 'react-icons/bs'
import { Divider, Tooltip } from '@mantine/core'
import { Dispatch, SetStateAction, useCallback, useMemo } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { Connection } from '../domain/connection'
import {
	getHealth,
	getMaxHealth,
	isUpgradeAffordable,
	toggleActivation,
	Upgrade,
} from '../domain/upgrade'
import {
	getActiveStats,
	getCost,
	Stats,
	StatsEffectResult,
} from '../domain/stats'
import { HealthBar } from './HealthBar'
import { StatsInfo } from './StatsInfo'
import { clamp } from '../domain/main'
import { FaHeart, FaShieldAlt } from 'react-icons/fa'
import { INITIAL_STATS } from '../data/initialGameData'

type UpgradeNodeProps = {
	upgrade: Upgrade
	upgrades: Upgrade[]
	connections: Connection[]
	setUpgrades: Dispatch<SetStateAction<Upgrade[]>>
	stats: StatsEffectResult
	power: number
	setPower: Dispatch<SetStateAction<number>>
}

export const UpgradeNode = ({
	stats,
	upgrade,
	upgrades,
	setUpgrades,
	connections,
	power,
	setPower,
}: UpgradeNodeProps) => {
	const { gridScale, timePassed } = useGameContext()
	const upgradeStats = stats.upgradeStats.get(upgrade.id)!
	const toggleUpgrade = useCallback(() => {
		setUpgrades((upgrades) => {
			const newUpgrades = toggleActivation(
				upgrade,
				upgrades,
				connections,
				power,
				stats
			)
			const activeUpgradeIds = upgrades
				.filter((u) => u.active)
				.map((u) => u.id)
			const newUpgradesCost = newUpgrades
				.filter((u) => u.active && !activeUpgradeIds.includes(u.id))
				.map((u) => getCost(stats, u))
				.reduce((prev, cur) => prev + cur, 0)
			const newUpgradesGainback = newUpgrades
				.filter((u) => !u.active && activeUpgradeIds.includes(u.id))
				.map((u) => getCost(stats, u))
				.reduce((prev, cur) => prev + cur, 0)
			setPower((prevPower) =>
				Math.max(0, prevPower - newUpgradesCost + newUpgradesGainback)
			)
			// const activeNewUpgrades = newUpgrades.filter(
			// 	(u) => u.active && !activeUpgradeIds.includes(u.id)
			// )
			return newUpgrades
		})
	}, [upgrade, stats, connections, setUpgrades])
	const isAffordable = isUpgradeAffordable(
		upgrade,
		upgrades,
		connections,
		stats,
		power
	)
	return (
		<div
			className="absolute flex items-center justify-center"
			style={{
				left: `${
					upgrade.x * gridScale - gridScale / 2 + gridScale / 8
				}px`,
				top: `${
					upgrade.y * gridScale - gridScale / 2 + gridScale / 8
				}px`,
				width: `${gridScale}px`,
				height: `${gridScale}px`,
			}}
		>
			{upgrade.active && upgradeStats.upgradeBulletAttackDamage !== 0 && (
				<div
					className="rounded-full absolute z-10 bg-red-900/10"
					style={{
						width: `${
							upgradeStats.upgradeBulletAttackRange *
							2 *
							gridScale
						}px`,
						height: `${
							upgradeStats.upgradeBulletAttackRange *
							2 *
							gridScale
						}px`,
					}}
				/>
			)}
			<Tooltip
				arrowRadius={0}
				className="p-0 bg-black/70"
				position="right-start"
				arrowPosition="side"
				arrowSize={gridScale / 8}
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
										connections,
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
						<div className="flex flex-col gap-2 p-2 pt-0">
							<div className="flex items-center gap-2">
								<FaHeart className="text-red-600" />{' '}
								{getHealth(upgrade, stats)} /{' '}
								{getMaxHealth(upgrade, stats)}
							</div>
							{upgradeStats.upgradeArmor !== 0 && (
								<div className="flex items-center gap-2">
									<FaShieldAlt className="text-cyan-600" />{' '}
									{upgradeStats.upgradeArmor}
								</div>
							)}
						</div>
					</>
				}
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
						upgradeStats.upgradeBulletAttackDamage !== 0 && (
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
												(timePassed -
													upgrade.lastBulletShotTime) /
													upgradeStats.upgradeBulletAttackSpeed
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
