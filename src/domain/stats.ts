import { INITIAL_STATS } from '../data/initialGameData'
import { Upgrade } from './upgrade'

// TODO: global stats and per upgrade node stats
export type Stats = {
	// Util
	power: number
	usedPower: number
	powerMultiplier: number
	upgradeCostMultiplier: number
	// Attack
	mouseDamage: number
	mouseSize: number
	mouseAttackSpeed: number
	// Defense
	health: number
	armor: number
}

// TODO is there an order?
export const getStatsFromActiveUpgrades = (
	upgrades: Upgrade[],
	enemiesKilled: number
): Stats => {
	const activeUpgrades = upgrades.filter((node) => node.active)

	const stats = activeUpgrades.reduce<Stats>((prev, cur) => {
		const stats = cur.effect(prev, cur, upgrades)
		return stats
	}, INITIAL_STATS)

	return {
		...stats,
		power: stats.power + enemiesKilled,
		// power: stats.power * stats.powerMultiplier,
		// usedPower: stats.usedPower * stats.upgradeCostMultiplier,
	}
}

export const hasNotEnoughPower = (stats: Stats) => stats.usedPower > stats.power

export const getCost = (stats: Stats, upgrade: Upgrade): number =>
	upgrade.cost * stats.upgradeCostMultiplier
