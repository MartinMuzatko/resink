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
	mouseSize: number
	mouseHealAmount: number
	mouseSpeed: number
	mouseAttackDamage: number
	upgradeBulletAttackDamage: number
	upgradeBulletAttackRange: number
	upgradeBulletAttackSpeed: number
	// Defense
	globalHealth: number
	globalHealthRegenerationAmount: number
	globalHealthRegenerationSpeed: number
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
	mouseAttackDamage: b.mouseAttackDamage - a.mouseAttackDamage,
	mouseSize: b.mouseSize - a.mouseSize,
	mouseHealAmount: b.mouseHealAmount - a.mouseHealAmount,
	mouseSpeed: b.mouseSpeed - a.mouseSpeed,
	upgradeBulletAttackDamage:
		b.upgradeBulletAttackDamage - a.upgradeBulletAttackDamage,
	upgradeBulletAttackSpeed:
		b.upgradeBulletAttackSpeed - a.upgradeBulletAttackSpeed,
	upgradeBulletAttackRange:
		b.upgradeBulletAttackRange - a.upgradeBulletAttackRange,
	globalHealth: b.globalHealth - a.globalHealth,
	globalHealthRegenerationAmount:
		a.globalHealthRegenerationAmount - b.globalHealthRegenerationAmount,
	globalHealthRegenerationSpeed:
		a.globalHealthRegenerationSpeed - b.globalHealthRegenerationSpeed,
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
