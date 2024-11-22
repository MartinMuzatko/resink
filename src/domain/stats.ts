import { INITIAL_STATS } from '../data/initialGameData'
import { Upgrade } from './upgrade'

type StatsTarget = 'all' | 'single'

type GlobalStats = {
	// Util
	maxPower: number
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
export const getStatsFromActiveUpgrades = (upgrades: Upgrade[]): Stats => {
	const activeUpgrades = upgrades.filter((node) => node.active)

	const stats = activeUpgrades.reduce<Stats>((prev, cur) => {
		const stats = cur.effect(prev, cur, upgrades)
		return stats
	}, INITIAL_STATS)
	return {
		...stats,
	}
}

export const getCost = (stats: Stats, upgrade: Upgrade): number =>
	Math.ceil(upgrade.cost * stats.upgradeCostMultiplier)
