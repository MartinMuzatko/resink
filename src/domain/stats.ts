import { Upgrade } from './upgrade'

// TODO: global stats and per upgrade node stats
export type Stats = {
	// Util
	power: number
	usedPower: number
	powerMultiplier: number
	upgradeCostMultiplier: number
	// Attack
	damage: number
	// Defense
	health: number
	armor: number
}

const DEFAULT_STATS: Stats = {
	power: 0,
	usedPower: 0,
	health: 1,
	powerMultiplier: 1,
	upgradeCostMultiplier: 1,
	armor: 0,
	damage: 1,
}

// TODO is there an order?
export const getStatsFromActiveUpgrades = (upgrades: Upgrade[]): Stats => {
	const activeUpgrades = upgrades.filter((node) => node.active)

	const stats = activeUpgrades.reduce<Stats>((prev, cur) => {
		const stats = cur.effect(prev, cur, upgrades)
		return stats
	}, DEFAULT_STATS)

	return {
		...stats,
		// power: stats.power * stats.powerMultiplier,
		// usedPower: stats.usedPower * stats.upgradeCostMultiplier,
	}
}

export const hasNotEnoughPower = (stats: Stats) => stats.usedPower > stats.power

export const getCost = (stats: Stats, upgrade: Upgrade): number =>
	upgrade.cost * stats.upgradeCostMultiplier
