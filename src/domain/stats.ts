import { INITIAL_STATS } from '../data/initialGameData'
import { Upgrade } from './upgrade'

type Target = 'all' | 'single' | 'tree'

type GlobalStats = {
	// Util
	power: number
	maxPower: number
	usedPower: number
	powerMultiplier: number
	powerPerEnemy: number
	// powerPerEnemy
	additionalPowerPerEnemyChance: number
	// Attack - Mouse Based
	mouseSize: number
	mouseHealAmount: number
	mouseSpeed: number
	mouseAttackDamage: number
	// mousePoisonAttackDamage: number
	// mousePoisonAttackSpeed: number
}

type UpgradeStats = {
	// Attack
	upgradeBulletAttackDamage: number
	upgradeBulletAttackRange: number
	upgradeBulletAttackSpeed: number
	upgradeBulletMaxAmmo: number
	upgradeBulletAmmoPrice: number
	// Defense
	upgradeHealth: number
	upgradeHealthRegenerationAmount: number
	upgradeHealthRegenerationSpeed: number
	upgradeArmor: number
	upgradeCostMultiplier: number
}

export type Stats = GlobalStats & UpgradeStats

/** subtracts a from b */
export const diffStats = (a: Stats, b: Stats): Stats => ({
	power: b.power - a.power,
	usedPower: b.usedPower - a.usedPower,
	maxPower: b.maxPower - a.maxPower,
	powerMultiplier: b.powerMultiplier - a.powerMultiplier,
	powerPerEnemy: b.powerPerEnemy - a.powerPerEnemy,
	additionalPowerPerEnemyChance:
		b.additionalPowerPerEnemyChance - a.additionalPowerPerEnemyChance,
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
	upgradeBulletMaxAmmo: b.upgradeBulletMaxAmmo - a.upgradeBulletMaxAmmo,
	upgradeBulletAmmoPrice: b.upgradeBulletAmmoPrice - a.upgradeBulletAmmoPrice,
	upgradeHealth: b.upgradeHealth - a.upgradeHealth,
	upgradeHealthRegenerationAmount:
		a.upgradeHealthRegenerationAmount - b.upgradeHealthRegenerationAmount,
	upgradeHealthRegenerationSpeed:
		a.upgradeHealthRegenerationSpeed - b.upgradeHealthRegenerationSpeed,
	upgradeArmor: b.upgradeArmor - a.upgradeArmor,
})

// TODO is there an order?
export const getStatsFromActiveUpgrades = (
	upgrades: Upgrade[],
	powerThroughKilledEnemies: number,
	powerSpentOnAmmo: number
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
				stats.power -
					stats.usedPower -
					powerSpentOnAmmo +
					powerThroughKilledEnemies,
				stats.maxPower
			),
		// power: stats.power * stats.powerMultiplier,
		// usedPower: stats.usedPower * stats.upgradeCostMultiplier,
	}
}

export const getAvailablePower = (stats: Stats) => stats.power - stats.usedPower

export const hasNotEnoughPower = (stats: Stats) => stats.usedPower > stats.power

export const getCost = (stats: Stats, upgrade: Upgrade): number =>
	upgrade.cost * stats.upgradeCostMultiplier
