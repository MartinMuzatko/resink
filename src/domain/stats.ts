import { Upgrade } from './upgrade'

export type Stats = {
	power: number
	usedPower: number
	upgradeHealth: number
	powerMultiplier: number
	upgradeCostMultiplier: number
}

const DEFAULT_STATS: Stats = {
	power: 0,
	usedPower: 0,
	upgradeHealth: 0,
	powerMultiplier: 1,
	upgradeCostMultiplier: 1,
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
		power: stats.power * stats.powerMultiplier,
		usedPower: stats.usedPower * stats.upgradeCostMultiplier,

		// usedPower: stats.
	}
}

export const hasNotEnoughPower = (stats: Stats) => stats.usedPower > stats.power

export const getCost = (stats: Stats, upgrade: Upgrade): number =>
	upgrade.cost * stats.upgradeCostMultiplier
