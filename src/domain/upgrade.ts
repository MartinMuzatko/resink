import { ReactNode } from 'react'
import { getDistance, Identifier, Position } from './main'
import { Connection } from './connection'
import { getCost, Stats } from './stats'

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
			stats: Stats,
			upgrade: Upgrade,
			upgrades: Upgrade[]
		) => ReactNode
		cost: number
		/** cumulates stats */
		effect: (stats: Stats, upgrade: Upgrade, upgrades: Upgrade[]) => Stats
		health: number
		lastTimeDamageTaken: number
	}

export const createUpgrade = (upgrade: Partial<Upgrade>): Upgrade => ({
	id: crypto.randomUUID(),
	type: UpgradeType.upgrade,
	x: 0,
	y: 0,
	active: false,
	cost: 0,
	effect: (stats) => stats,
	icon: 'M',
	health: 10,
	lastTimeDamageTaken: 0,
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
	stats: Stats
) => {
	const parentUpgrade = findDirectParent(upgrade, upgrades, connections)
	if (!parentUpgrade) return upgrades

	const isActivating = !upgrade.active
	const upgradeIndex = upgrades.findIndex((node) => node.id == upgrade.id)
	const canActivate =
		parentUpgrade.active && stats.usedPower + upgrade.cost <= stats.power
	if (isActivating)
		return upgrades.toSpliced(upgradeIndex, 1, {
			...upgrade,
			active: canActivate ? !upgrade.active : upgrade.active,
			health: canActivate
				? upgrade.effect(stats, upgrade, upgrades).globalHealth
				: upgrade.health,
		})
	return deactivateSubTree(upgrade, upgrades, connections)
	// TODO: If we can no longer afford nodes, deactivate other nodes until we have money.
	// This could kill the fun in the game since unexpectedly things get destroyed.
	// Instead the player has to make room for resources or shift strategy - more fun maybe
}

export const getHealth = (upgrade: Upgrade, stats: Stats) =>
	upgrade.type == UpgradeType.motor
		? Math.min(upgrade.health, stats.globalHealth + 9)
		: Math.min(upgrade.health, stats.globalHealth)

export const getMaxHealth = (upgrade: Upgrade, stats: Stats) =>
	upgrade.type == UpgradeType.motor
		? stats.globalHealth + 9
		: stats.globalHealth

export const updateUpgradeDamage = (
	upgradeIdsToTakeDamage: string[],
	upgrades: Upgrade[],
	connections: Connection[],
	timePassed: number,
	stats: Stats
) => {
	const damagedUpgrades = upgrades.map((upgrade) =>
		upgradeIdsToTakeDamage.includes(upgrade.id) &&
		upgrade.lastTimeDamageTaken < timePassed - 1000
			? {
					...upgrade,
					health: getHealth(upgrade, stats) - 1,
					active: getHealth(upgrade, stats) > 0,
					lastTimeDamageTaken: timePassed,
			  }
			: upgrade
	)

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
	stats: Stats
) => {
	const from = upgrades.find(
		(u) =>
			u.id ===
			connections.find((c) => c.toUpgradeId == upgrade.id)?.fromUpgradeId
	)
	return (
		from?.active && getCost(stats, upgrade) <= stats.power - stats.usedPower
	)
}
