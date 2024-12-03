import { Connection } from './connection'
import { Upgrade } from './upgrade'

/** will be executed for each upgrade */
type TargetFilterFunction = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[]
) => boolean

export enum StatDisplay {
	'value',
	'percentage',
}

export enum StatType {
	'global',
	'scoped',
}

type StatDefinition = {
	name: string
	className: string
	display: StatDisplay
	type: StatType
}

export const statDefinitions = {
	// Util
	maxPower: {
		name: 'Max Power',
		className: 'text-blue-800',
		display: StatDisplay.value,
		type: StatType.global,
	},
	powerMultiplier: {
		name: 'Power Multiplier',
		className: '',
		display: StatDisplay.value,
		type: StatType.global,
	},
	powerPerEnemy: {
		name: 'Power Per Enemy',
		className: 'text-cyan-400',
		display: StatDisplay.value,
		type: StatType.global,
	},
	additionalPowerPerEnemyChance: {
		name: 'Additional Power Per Enemy Chance',
		className: 'text-red-600',
		display: StatDisplay.value,
		type: StatType.global,
	},
	// MouseArea
	mouseSize: {
		name: 'Mouse Size',
		className: 'text-amber-600',
		display: StatDisplay.value,
		type: StatType.global,
	},
	mouseHealAmount: {
		name: 'Mouse Heal Amount',
		className: 'text-lime-400',
		display: StatDisplay.value,
		type: StatType.global,
	},
	mouseSpeed: {
		name: 'Mouse Speed',
		className: 'text-teal-400',
		display: StatDisplay.value,
		type: StatType.global,
	},
	mouseAttackDamage: {
		name: 'Mouse Attack Damage',
		className: 'text-red-600',
		display: StatDisplay.value,
		type: StatType.global,
	},
	// Bullets
	bulletMaxAmmo: {
		name: 'Bullet Max Ammo',
		className: 'text-green-400',
		display: StatDisplay.value,
		type: StatType.global,
	},
	bulletAmmoPrice: {
		name: 'Bullet Ammo Price',
		className: 'text-teal-400',
		display: StatDisplay.value,
		type: StatType.global,
	},
	upgradeBulletAttackDamage: {
		name: 'Bullet Attack Damage',
		className: 'text-red-400',
		display: StatDisplay.value,
		type: StatType.scoped,
	},
	upgradeBulletAttackRange: {
		name: 'Bullet Attack Range',
		className: 'text-green-400',
		display: StatDisplay.value,
		type: StatType.scoped,
	},
	upgradeBulletAttackSpeed: {
		name: 'Bullet Attack Speed',
		className: 'text-teal-400',
		display: StatDisplay.value,
		type: StatType.scoped,
	},
	upgradeHealth: {
		name: 'Health',
		className: 'text-green-600',
		display: StatDisplay.value,
		type: StatType.scoped,
	},
	upgradeHealthRegenerationAmount: {
		name: 'Health Regeneration Amount',
		className: 'text-teal-400',
		display: StatDisplay.value,
		type: StatType.scoped,
	},
	upgradeHealthRegenerationSpeed: {
		name: 'Health Regeneration Speed',
		className: 'text-teal-400',
		display: StatDisplay.value,
		type: StatType.scoped,
	},
	upgradeArmor: {
		name: 'Armor',
		className: 'text-cyan-400',
		display: StatDisplay.value,
		type: StatType.scoped,
	},
	upgradeCostMultiplier: {
		name: 'Cost Multiplier',
		className: 'text-cyan-400',
		display: StatDisplay.value,
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
		if (!('filter' in effect)) return acc
		const upgradeStats = new Map(
			upgrades.flatMap((upgrade) => {
				const doesEffect = effect.filter(upgrade, upgrades, connections)
				return [
					[
						upgrade.id,
						doesEffect
							? effect.stats(
									acc.get(upgrade.id)!,
									upgrade,
									upgrades
							  )
							: globalStats,
					],
				]
			}) as [string, UpgradeStatsEffectStats][]
		)

		return new Map(
			upgradeStats
				.entries()
				.map(([upgradeId, upgradeStat]) => [
					upgradeId,
					mergeStats(acc.get(upgradeId)!, upgradeStat),
				])
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
	return {
		globalStats: diffStats(
			stats.globalStats,
			statsWithUpgradeActive.globalStats
		),
		upgradeStats: new Map(
			statsWithUpgradeActive.upgradeStats
				.entries()
				.map(([upgradeId, upgradeStats]) => [
					upgradeId,
					diffStats(stats.upgradeStats.get(upgradeId), upgradeStats),
				])
		),
	}
}

export const getCost = (stats: StatsEffectResult, upgrade: Upgrade): number =>
	Math.ceil(
		upgrade.cost * stats.upgradeStats.get(upgrade.id)!.upgradeCostMultiplier
	)
