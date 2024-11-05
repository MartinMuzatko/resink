import { INITIAL_STATS } from '../data/initialGameData'
import { Upgrade } from './upgrade'

// TODO: global stats and per upgrade node stats
export type Stats = {
	// Util
	power: number
	maxPower: number
	usedPower: number
	powerMultiplier: number
	upgradeCostMultiplier: number
	// Attack
	mouseDamage: number
	mouseSize: number
	mouseAttackSpeed: number
	// Defense
	globalHealth: number
	globalArmor: number
	upgradeHealth: number
	upgradeArmor: number
}

/** subtracts a from b */
export const diffStats = (a: Stats, b: Stats): Stats => ({
	power: b.power - a.power,
	usedPower: b.usedPower - a.usedPower,
	maxPower: b.maxPower - a.maxPower,
	powerMultiplier: b.powerMultiplier - a.powerMultiplier,
	upgradeCostMultiplier: b.upgradeCostMultiplier - a.upgradeCostMultiplier,
	mouseDamage: b.mouseDamage - a.mouseDamage,
	mouseSize: b.mouseSize - a.mouseSize,
	mouseAttackSpeed: b.mouseAttackSpeed - a.mouseAttackSpeed,
	globalHealth: b.globalHealth - a.globalHealth,
	globalArmor: b.globalArmor - a.globalArmor,
	upgradeHealth: b.upgradeHealth - a.upgradeHealth,
	upgradeArmor: b.upgradeArmor - a.upgradeArmor,
})

// TODO is there an order?
export const getStatsFromActiveUpgrades = (
	upgrades: Upgrade[],
	powerThroughKilledEnemies: number
): Stats => {
	const activeUpgrades = upgrades.filter((node) => node.active)

	const stats = activeUpgrades.reduce<Stats>((prev, cur) => {
		const stats = cur.effect(prev, cur, upgrades)
		return stats
	}, INITIAL_STATS)
	return {
		...stats,
		power:
			stats.usedPower +
			Math.min(
				stats.power - stats.usedPower + powerThroughKilledEnemies,
				stats.maxPower
			),
		// power: stats.power * stats.powerMultiplier,
		// usedPower: stats.usedPower * stats.upgradeCostMultiplier,
	}
}

export const hasNotEnoughPower = (stats: Stats) => stats.usedPower > stats.power

export const getCost = (stats: Stats, upgrade: Upgrade): number =>
	upgrade.cost * stats.upgradeCostMultiplier
