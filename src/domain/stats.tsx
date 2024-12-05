import { ReactNode } from 'react'
import { Connection } from './connection'
import { Upgrade } from './upgrade'
import { BsLightningChargeFill } from 'react-icons/bs'
import { GiHeavyBullets } from 'react-icons/gi'

/** will be executed for each upgrade */
type TargetFilterFunction = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[]
) => boolean

export enum StatType {
	'global',
	'scoped',
}

type StatDefinition = {
	name: string
	className: string
	type: StatType
	format?: (value: number) => ReactNode
}

export const statDefinitions = {
	// Power
	maxPower: {
		name: 'Max Power',
		className: 'text-amber-400',
		type: StatType.global,
	},
	powerMultiplier: {
		name: 'Power Multiplier',
		className: '',
		type: StatType.global,
	},
	powerPerEnemy: {
		name: 'Power Per Enemy',
		className: 'text-cyan-400',
		type: StatType.global,
	},
	additionalPowerPerEnemyChance: {
		name: 'Additional Power Per Enemy Chance',
		className: 'text-red-600',
		type: StatType.global,
	},
	experienceOrbAttractionRadius: {
		name: 'Experience Attraction Radius',
		className: 'text-purple-300',
		type: StatType.global,
	},
	// MouseArea
	mouseSize: {
		name: 'Area Size',
		className: 'text-amber-600',
		type: StatType.global,
	},
	mouseHealAmount: {
		name: 'Area Heal Amount',
		className: 'text-lime-400',
		type: StatType.global,
	},
	mouseSpeed: {
		name: 'Area Attack Speed',
		className: 'text-teal-400',
		type: StatType.global,
		format: (value) => `${value / 10}%`,
	},
	mouseAttackDamage: {
		name: 'Area Attack Damage',
		className: 'text-red-600',
		type: StatType.global,
	},
	// Bullets
	bulletMaxAmmo: {
		name: 'Bullet Max Ammo',
		className: 'text-green-400',
		type: StatType.global,
	},
	bulletAmmoPrice: {
		name: 'Bullet Ammo Price',
		className: 'text-teal-400',
		type: StatType.global,
		format: (value) => (
			<div className="flex items-center">
				{value.toFixed(2)}
				<BsLightningChargeFill />/ <GiHeavyBullets className="ml-1" />
			</div>
		),
	},
	upgradeBulletAttackDamage: {
		name: 'Bullet Attack Damage',
		className: 'text-red-400',
		type: StatType.scoped,
	},
	upgradeBulletAttackRange: {
		name: 'Bullet Attack Range',
		className: 'text-green-400',
		type: StatType.scoped,
	},
	upgradeBulletAttackSpeed: {
		name: 'Bullet Attack Speed',
		className: 'text-teal-400',
		type: StatType.scoped,
	},
	upgradeBulletProjectileSpeed: {
		name: 'Bullet Speed',
		className: 'text-amber-400',
		type: StatType.scoped,
	},
	// Health
	upgradeHealth: {
		name: 'Health',
		className: 'text-green-600',
		type: StatType.scoped,
	},
	upgradeHealthRegenerationAmount: {
		name: 'Health Regeneration Amount',
		className: 'text-teal-400',
		type: StatType.scoped,
	},
	upgradeHealthRegenerationSpeed: {
		name: 'Health Regeneration Speed',
		className: 'text-teal-400',
		type: StatType.scoped,
	},
	upgradeArmor: {
		name: 'Armor',
		className: 'text-cyan-400',
		type: StatType.scoped,
	},
	upgradeCostMultiplier: {
		name: 'Cost Multiplier',
		className: 'text-cyan-400',
		type: StatType.scoped,
	},
	// Power Generation
	upgradePowerGenerationSpeed: {
		name: 'Power Generation Speed',
		className: 'text-cyan-400',
		type: StatType.scoped,
		format: (value) => `${value / 1000}s`,
	},
	upgradePowerGenerationAmount: {
		name: 'Power Generation Amount',
		className: 'text-cyan-400',
		type: StatType.scoped,
	},
	upgradePowerGenerationMaxAmount: {
		name: 'Power Generation Max Amount',
		className: 'text-cyan-400',
		type: StatType.scoped,
	},
	upgradePowerGenerationDecay: {
		name: 'Experience Decay',
		className: 'text-cyan-400',
		type: StatType.scoped,
	},
} as const satisfies Record<string, StatDefinition>

export type StatKeys = keyof typeof statDefinitions

type UpgradeStatKeys = {
	[K in keyof typeof statDefinitions]: (typeof statDefinitions)[K]['type'] extends StatType.scoped
		? K
		: never
}[keyof typeof statDefinitions]

type UpgradeStatsEffectStats = Partial<Record<UpgradeStatKeys, number>>

type UpgradeStatsEffect = {
	stats: (
		stats: Stats,
		upgrade: Upgrade,
		upgrades: Upgrade[]
	) => UpgradeStatsEffectStats
	filter: TargetFilterFunction
}

type GlobalStatsEffect = {
	stats: (
		stats: Stats,
		upgrade: Upgrade,
		upgrades: Upgrade[]
	) => Partial<Record<StatKeys, number>>
}

export type StatsEffect = UpgradeStatsEffect | GlobalStatsEffect

export type Stats = Record<StatKeys, number>
export type UpgradeStats = Record<UpgradeStatKeys, number>

export type StatsEffectResult = {
	globalStats: Stats
	upgradeStats: Map<string, UpgradeStats>
}

/** subtracts a from b */
export const diffStats = (a: Stats, b: Stats): Stats => ({
	...(Object.fromEntries(
		[...new Set([...Object.keys(a), ...Object.keys(b)])].map((key) => [
			key,
			b[key as keyof Stats] - a[key as keyof Stats],
		])
	) as Stats),
})

/** adds b to a  */
export const addStats = (
	a: Partial<Stats>,
	b: Partial<Stats>
): Partial<Stats> => ({
	...(Object.fromEntries(
		[...new Set([...Object.keys(a), ...Object.keys(b)])].map((key) => [
			key,
			(a[key as keyof Stats] ?? 0) + (b[key as keyof Stats] ?? 0),
		])
	) as Stats),
})

export const mergeStats = (a: Stats, b: Partial<Stats>): Stats => ({
	...(Object.fromEntries(
		[...new Set([...Object.keys(a), ...Object.keys(b)])].map((key) => [
			key,
			b[key as keyof Stats] ?? a[key as keyof Stats],
		])
	) as Stats),
})

export const removeEmtpyStatKeys = (stats: Partial<Stats>): Partial<Stats> =>
	Object.fromEntries(
		Object.entries(stats).filter(([key, stat]) => stat !== 0)
	) as Stats

export const isStatsEmpty = (stats: Stats): boolean =>
	Object.entries(stats).some(([key, value]) => value !== 0)

export const reduceStatsEffects = (
	upgrades: Upgrade[],
	acc: Map<string, Stats>,
	effect: StatsEffect,
	globalStats: Stats,
	connections: Connection[]
) => {
	if (!('filter' in effect)) return acc

	return new Map(
		upgrades.flatMap((upgrade) => {
			const currentStats = acc.get(upgrade.id)!
			const doesEffect = effect.filter(upgrade, upgrades, connections)
			return [
				[
					upgrade.id,
					mergeStats(
						currentStats,
						doesEffect
							? effect.stats(currentStats, upgrade, upgrades)
							: {}
					),
				],
			]
		}) as [string, Stats][]
	)
}

/**
 * Get stats for all upgrades and global stats
 * All stats are completely calculated
 */
export const getActiveStats = (
	upgrades: Upgrade[],
	connections: Connection[],
	initialStats: Stats
): StatsEffectResult => {
	const activeUpgrades = upgrades.filter((node) => node.active)
	const statsEffects = activeUpgrades.flatMap((upgrade) =>
		upgrade.effect.map((effect) => ({ upgrade, effect }))
	)

	const globalStats = statsEffects.reduce((acc, { upgrade, effect }) => {
		if ('filter' in effect) return acc
		const s = effect.stats(acc, upgrade, upgrades)
		return mergeStats(acc, s)
	}, initialStats)

	const upgradeStats = statsEffects.reduce((acc, { effect }) => {
		return reduceStatsEffects(
			upgrades,
			acc,
			effect,
			globalStats,
			connections
		)
	}, new Map(upgrades.map((u) => [u.id, globalStats])))

	return {
		globalStats,
		upgradeStats,
	}
}

export const getUpgradeDisplayStats = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[],
	initialStats: Stats,
	stats: StatsEffectResult
): StatsEffectResult => {
	const statsWithUpgradeActive = getActiveStats(
		upgrades.toSpliced(
			upgrades.findIndex((u) => u.id === upgrade.id),
			1,
			{ ...upgrade, active: true }
		),
		connections,
		initialStats
	)

	const relatedUpgradeIds = [
		...new Set(
			upgrade.effect.flatMap((effect) => {
				if (!('filter' in effect)) return []
				return upgrades.flatMap((upgrade) =>
					effect.filter(upgrade, upgrades, connections)
						? [upgrade.id]
						: []
				)
			})
		),
	]

	return {
		globalStats: diffStats(
			stats.globalStats,
			statsWithUpgradeActive.globalStats
		),
		upgradeStats: new Map(
			relatedUpgradeIds.map(
				(upgradeId) =>
					[
						upgradeId,
						diffStats(
							// @ts-ignore
							stats.upgradeStats.get(upgradeId)!,
							statsWithUpgradeActive.upgradeStats.get(upgradeId)!
						),
					] as const
			)
		),
	}
}

export const getCost = (stats: StatsEffectResult, upgrade: Upgrade): number =>
	Math.ceil(
		upgrade.cost * stats.upgradeStats.get(upgrade.id)!.upgradeCostMultiplier
	)
