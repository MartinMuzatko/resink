import { Connection } from './connection'
import { createUpgrade, Upgrade } from './upgrade'

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

type GlobalStatKeys = {
	[K in keyof typeof statDefinitions]: (typeof statDefinitions)[K]['type'] extends StatType.global
		? K
		: never
}[keyof typeof statDefinitions]

type UpgradeStatKeys = {
	[K in keyof typeof statDefinitions]: (typeof statDefinitions)[K]['type'] extends StatType.scoped
		? K
		: never
}[keyof typeof statDefinitions]

type UpgradeStatsEffectStats = Partial<Record<UpgradeStatKeys, number>>

type UpgradeStatsEffect = {
	stats: UpgradeStatsEffectStats
	filter: TargetFilterFunction
}

type GlobalStatsEffect = {
	stats: Partial<Record<StatKeys, number>>
}

export type StatsEffect = UpgradeStatsEffect | GlobalStatsEffect

export type Stats = Record<StatKeys, number>
export type UpgradeStats = Record<UpgradeStatKeys, number>

type StatsEffectResult = {
	globalStats: Stats
	upgradeStats: Map<string, UpgradeStats>
}

type IntermediateStatsEffectResult = {
	globalStats: Partial<Stats>
	upgradeStats: Map<string, Partial<UpgradeStats>>
}

type ResolvedStats = Map<string, Stats>

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

export const mergeStats = (
	a: Partial<Stats>,
	b: Partial<Stats>
): Partial<Stats> => ({
	...(Object.fromEntries(
		[...new Set([...Object.keys(a), ...Object.keys(b)])].map((key) => [
			key,
			b[key as keyof Stats] ?? a[key as keyof Stats],
		])
	) as Stats),
})

/**
 * Get stats for all upgrades
 */
export const getActiveStats = (
	upgrades: Upgrade[],
	connections: Connection[],
	initialStats: Stats
): StatsEffectResult => {
	const activeUpgrades = upgrades.filter((node) => node.active)
	return activeUpgrades.reduce(
		(acc, upgrade) => {
			const stats = addStats(
				acc.globalStats,
				acc.upgradeStats.get(upgrade.id) || {}
			) as Stats
			const statsEffects = upgrade.effect(stats, upgrade, upgrades)
			const statsEffectResult = statsEffects.reduce(
				(acc, statsEffect) => {
					const shouldFilter = 'filter' in statsEffect
					if (!shouldFilter)
						return {
							globalStats: mergeStats(
								acc.globalStats,
								statsEffect.stats
							),
							upgradeStats: acc.upgradeStats,
						} satisfies IntermediateStatsEffectResult
					const upgradeStats = new Map(
						upgrades.flatMap((upgrade) => {
							const doesEffect = statsEffect.filter(
								upgrade,
								upgrades,
								connections
							)
							return doesEffect
								? [[upgrade.id, statsEffect.stats]]
								: []
							// ({upgradeId: upgrade.id, filter: filter(upgrade)})
						}) as [string, UpgradeStatsEffectStats][]
					)
					return {
						globalStats: acc.globalStats,
						upgradeStats: new Map(
							upgradeStats
								.entries()
								.map(([upgradeId, upgradeStat]) => [
									upgradeId,
									addStats(
										acc.upgradeStats.get(upgradeId) ?? {},
										upgradeStat
									),
								])
						),
					} satisfies IntermediateStatsEffectResult
				},
				{
					globalStats: initialStats,
					upgradeStats: new Map<string, UpgradeStats>(),
				} as IntermediateStatsEffectResult
			) as StatsEffectResult
			return statsEffectResult
		},
		{
			globalStats: initialStats,
			upgradeStats: new Map(),
		} as StatsEffectResult
	)
}

// export const getActiveGlobalStats = (
// 	upgrades: Upgrade[],
// 	connections: Connection[],
// 	initialStats: Stats
// ): Stats =>
// 	getActiveStats(upgrades, connections, initialStats, NULL_FILTER_UPGRADE())

export const getCost = (stats: Stats, upgrade: Upgrade): number =>
	Math.ceil(upgrade.cost * stats.upgradeCostMultiplier)
