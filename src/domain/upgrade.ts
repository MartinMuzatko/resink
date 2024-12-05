import { ReactNode } from 'react'
import {
	addPosition,
	getDistance,
	getSpeedVector,
	Identifier,
	Position,
} from './main'
import { Connection } from './connection'
import {
	getCost,
	Stats,
	StatsEffect,
	StatsEffectResult,
	UpgradeStats,
} from './stats'
import { canEnemyDealDamage, Enemy } from './enemy'
import { Bullet, createBullet } from './bullet'
import {
	createExperienceOrb,
	distributePointOnCircle,
	ExperienceOrb,
	ExperienceOrbSource,
} from './experienceOrb'

export enum UpgradeType {
	motor,
	upgrade,
}

export type Upgrade = Identifier &
	Position & {
		type: UpgradeType
		active: boolean
		icon: ReactNode
		description?: ReactNode
		title?: ReactNode
		tooltip?: (
			stats: StatsEffectResult,
			upgrade: Upgrade,
			upgrades: Upgrade[]
		) => ReactNode
		cost: number
		/** cumulates stats */
		effect: StatsEffect[]
		// activate
		// deactivate
		// destroy
		//
		// onActivate?: (
		// 	stats: StatsEffectResult,
		// 	upgrade: Upgrade,
		// 	upgrades: Upgrade[]
		// ) => Upgrade
		// onDeactivate?: (
		// 	stats: StatsEffectResult,
		// 	upgrade: Upgrade,
		// 	upgrades: Upgrade[]
		// ) => Upgrade
		health: number
		lastDamageTakenTime: number
		lastBulletShotTime: number
		lastExperienceOrbGeneratedTime: number
	}

export type UpgradeDamageUpdate = {
	upgrade: Upgrade
	enemiesThatDealDamage: Enemy[]
	damage: number
}

export const createUpgrade = (
	upgrade: Partial<Upgrade> & Pick<Upgrade, 'effect'>
): Upgrade => ({
	id: crypto.randomUUID(),
	type: UpgradeType.upgrade,
	x: 0,
	y: 0,
	active: false,
	cost: 0,
	icon: 'M',
	health: 10,
	lastBulletShotTime: 0,
	lastDamageTakenTime: 0,
	lastExperienceOrbGeneratedTime: 0,
	...upgrade,
})

export const findDirectChildren = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[]
) =>
	upgrades.filter((node) =>
		connections.some(
			(connection) =>
				connection.fromUpgradeId == upgrade.id &&
				connection.toUpgradeId == node.id
		)
	)
const ORIGIN_POSITION = { x: 0, y: 0 }

export const findFurthestUpgradePosition = (upgrades: Upgrade[]): Position => {
	return upgrades.length === 0
		? ORIGIN_POSITION
		: upgrades.reduce((furthest, upgrade) => {
				return getDistance(ORIGIN_POSITION, upgrade) >
					getDistance(ORIGIN_POSITION, furthest)
					? upgrade
					: furthest
		  })
}

export const findAllChildren = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[]
): Upgrade[] => {
	const directChildren = findDirectChildren(upgrade, upgrades, connections)
	const allDescendants = directChildren.flatMap((child) =>
		findAllChildren(child, upgrades, connections)
	)
	return [...directChildren, ...allDescendants]
}

export const findDirectParent = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[]
) =>
	upgrades.find((node) =>
		connections.some(
			(connection) =>
				connection.toUpgradeId == upgrade.id &&
				connection.fromUpgradeId == node.id
		)
	)

export const findSiblings = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[]
) => {
	const parent = findDirectParent(upgrade, upgrades, connections)
	if (!parent) return []
	return findDirectChildren(parent, upgrades, connections)
}

export const findAllLeaves = (
	upgrades: Upgrade[],
	connections: Connection[]
): Upgrade[] =>
	upgrades.filter(
		(upgrade) =>
			!connections.find(
				(connection) => connection.fromUpgradeId == upgrade.id
			)
	)

export const findAllParents = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[]
): Upgrade[] => {
	const directParent = findDirectParent(upgrade, upgrades, connections)
	if (!directParent) return []
	const allAncestors = findAllParents(directParent, upgrades, connections)

	// Combine the direct parent with all ancestors
	return [directParent, ...allAncestors]
}

export const deactivateSubTree = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[]
) => {
	const allChildrenIds = findAllChildren(upgrade, upgrades, connections).map(
		(upgrade) => upgrade.id
	)
	return upgrades.map((u) => ({
		...u,
		...(allChildrenIds.includes(u.id) || u.id == upgrade.id
			? { active: false }
			: {}),
	}))
}

export const toggleActivation = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[],
	power: number,
	stats: StatsEffectResult,
	timePassed: number
) => {
	const parentUpgrade = findDirectParent(upgrade, upgrades, connections)
	if (!parentUpgrade) return upgrades

	const isActivating = !upgrade.active
	const upgradeIndex = upgrades.findIndex((node) => node.id == upgrade.id)
	const canActivate = parentUpgrade.active && power >= getCost(stats, upgrade)
	if (isActivating)
		return upgrades.toSpliced(upgradeIndex, 1, {
			...upgrade,
			...(canActivate
				? {
						active: !upgrade.active,
						health: stats.upgradeStats.get(upgrade.id)!
							.upgradeHealth,
						// lastBulletShotTime: timePassed / 1000,
						// lastDamageTakenTime: timePassed / 1000,
						// lastExperienceOrbGeneratedTime: timePassed / 1000,
				  }
				: {}),
		})
	return deactivateSubTree(upgrade, upgrades, connections)
	// TODO: If we can no longer afford nodes, deactivate other nodes until we have money.
	// This could kill the fun in the game since unexpectedly things get destroyed.
	// Instead the player has to make room for resources or shift strategy - more fun maybe
}

export const getHealth = (upgrade: Upgrade, stats: StatsEffectResult) =>
	upgrade.type == UpgradeType.motor
		? Math.min(
				upgrade.health,
				stats.upgradeStats.get(upgrade.id)!.upgradeHealth + 9
		  )
		: Math.min(
				upgrade.health,
				stats.upgradeStats.get(upgrade.id)!.upgradeHealth
		  )

export const getMaxHealth = (upgrade: Upgrade, stats: StatsEffectResult) =>
	upgrade.type == UpgradeType.motor
		? stats.upgradeStats.get(upgrade.id)!.upgradeHealth + 9
		: stats.upgradeStats.get(upgrade.id)!.upgradeHealth

export const updateUpgradeDamage = (
	upgradesToTakeDamage: UpgradeDamageUpdate[],
	upgrades: Upgrade[],
	connections: Connection[],
	timePassed: number,
	stats: StatsEffectResult
) => {
	const upgradeIdsToTakeDamage = [
		...new Set(upgradesToTakeDamage.flatMap((u) => u.upgrade.id)),
	]
	const damagedUpgrades = upgrades.map((upgrade) => {
		const update = upgradesToTakeDamage.find(
			(u) => u.upgrade.id === upgrade.id
		)
		if (!update || !update.damage) return upgrade
		return upgradeIdsToTakeDamage.includes(upgrade.id) &&
			upgrade.lastDamageTakenTime <
				timePassed -
					stats.upgradeStats.get(upgrade.id)!.upgradeBulletAttackSpeed
			? {
					...upgrade,
					health:
						getHealth(upgrade, stats) -
						Math.max(
							update.damage -
								stats.upgradeStats.get(upgrade.id)!
									.upgradeArmor,
							0
						),
					active: getHealth(upgrade, stats) > 0,
					lastDamageTakenTime: timePassed,
			  }
			: upgrade
	})

	const allDeactivatedIds = upgradeIdsToTakeDamage
		.map((upgradeId) => upgrades.find((u) => u.id === upgradeId)!)
		.filter((upgrade) => !upgrade.active)
		.flatMap((upgrade) => {
			return [
				...findAllChildren(upgrade, upgrades, connections).map(
					(u) => u.id
				),
				upgrade.id,
			]
		})

	// Deactivate the appropriate upgrades
	return damagedUpgrades.map((u) => ({
		...u,
		...(allDeactivatedIds.includes(u.id) ? { active: false } : {}),
	}))
}

export const isUpgradeAffordable = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[],
	stats: StatsEffectResult,
	power: number
) => {
	const from = upgrades.find(
		(u) =>
			u.id ===
			connections.find((c) => c.toUpgradeId == upgrade.id)?.fromUpgradeId
	)
	return from?.active && power >= getCost(stats, upgrade)
}

// TODO: ammo might be less than 0 if upgrade shoots, since everything is calculated together
export const canUpgradeShoot = (
	upgrade: Upgrade,
	stats: UpgradeStats,
	timePassed: number,
	ammo: number
) =>
	timePassed >= upgrade.lastBulletShotTime + stats.upgradeBulletAttackSpeed &&
	stats.upgradeBulletAttackDamage !== 0 &&
	upgrade.active &&
	ammo > 0

export const canUpgradeGeneratePower = (
	upgrade: Upgrade,
	stats: UpgradeStats,
	timePassed: number,
	experienceOrbs: ExperienceOrb[]
) =>
	timePassed >=
		upgrade.lastExperienceOrbGeneratedTime +
			stats.upgradePowerGenerationSpeed &&
	experienceOrbs.filter((e) => e.source === ExperienceOrbSource.upgrade)
		.length < stats.upgradePowerGenerationMaxAmount &&
	stats.upgradePowerGenerationAmount !== 0 &&
	upgrade.active

export const damageUpgrade = (
	upgrade: Upgrade,
	enemies: Enemy[],
	timePassed: number
) => {
	const enemiesThatDealDamage = enemies.filter((enemy) =>
		canEnemyDealDamage(enemy, upgrade, timePassed)
	)
	return {
		upgrade,
		enemiesThatDealDamage,
		damage: enemiesThatDealDamage.reduce(
			(acc, cur) => acc + cur.attackDamage,
			0
		),
	}
}

export const shootBullets = (
	prevUpgrades: Upgrade[],
	stats: StatsEffectResult,
	timePassed: number,
	ammo: number,
	enemies: Enemy[]
) =>
	prevUpgrades.reduce<{
		upgrades: Upgrade[]
		bullets: Bullet[]
	}>(
		({ upgrades, bullets }, upgrade) => {
			const upgradeStats = stats.upgradeStats.get(upgrade.id)!
			if (!canUpgradeShoot(upgrade, upgradeStats, timePassed, ammo))
				return { upgrades: [...upgrades, upgrade], bullets }

			const enemiesInRange = enemies.filter(
				(enemy) =>
					getDistance(upgrade, enemy) <
					stats.upgradeStats.get(upgrade.id)!.upgradeBulletAttackRange
			)

			if (enemiesInRange.length === 0)
				return { upgrades: [...upgrades, upgrade], bullets }

			const targetEnemy = enemiesInRange.reduce((closest, enemy) =>
				getDistance(upgrade, enemy) < getDistance(upgrade, closest)
					? enemy
					: closest
			)

			const updatedUpgrade = {
				...upgrade,
				lastBulletShotTime: timePassed,
			}
			// TODO: React.StrictMode makes this get added twice per tick in dev mode
			// we could add a tickFired prop and compare then.
			const newBullet = createBullet({
				x: upgrade.x,
				y: upgrade.y,
				attackDamage: upgradeStats.upgradeBulletAttackDamage,
				velocity: getSpeedVector(
					{ x: upgrade.x, y: upgrade.y },
					targetEnemy,
					upgradeStats.upgradeBulletProjectileSpeed
				),
			})

			return {
				upgrades: [...upgrades, updatedUpgrade],
				bullets: [...bullets, newBullet],
			}
		},
		{ upgrades: [], bullets: [] } // Initial value with the specified type
	)

export const generateExperienceOrbs = (
	prevUpgrades: Upgrade[],
	stats: StatsEffectResult,
	timePassed: number,
	experienceOrbs: ExperienceOrb[]
) =>
	prevUpgrades.reduce(
		(acc, upgrade) => {
			const canGenerate = canUpgradeGeneratePower(
				upgrade,
				stats.upgradeStats.get(upgrade.id)!,
				timePassed,
				experienceOrbs
			)
			return {
				upgrades: [
					...acc.upgrades,
					canGenerate
						? {
								...upgrade,
								lastExperienceOrbGeneratedTime: timePassed,
						  }
						: upgrade,
				],
				experienceOrbs: [
					...acc.experienceOrbs,
					...(canGenerate
						? [
								createExperienceOrb({
									source: ExperienceOrbSource.upgrade,
									...addPosition(
										distributePointOnCircle(
											stats.upgradeStats.get(upgrade.id)!
												.upgradePowerGenerationMaxAmount,
											experienceOrbs.filter(
												(e) =>
													e.source ===
													ExperienceOrbSource.upgrade
											).length,
											0.5
										),
										addPosition(upgrade, {
											x: 0.125,
											y: 0.125,
										})
									),
								}),
						  ]
						: []),
				],
			}
		},
		{ upgrades: [], experienceOrbs: [] } as {
			upgrades: Upgrade[]
			experienceOrbs: ExperienceOrb[]
		}
	)
