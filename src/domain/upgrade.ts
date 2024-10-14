import { ReactNode } from 'react'
import { Identifier, Position } from './main'
import { Connection } from './connection'
import { getStatsFromActiveUpgrades, hasNotEnoughPower } from './stats'

export enum UpgradeType {
	motor,
	upgrade,
}

export type Stats = {
	power: number
	usedPower: number
}

export type Upgrade = Identifier &
	Position & {
		type: UpgradeType
		active: boolean
		icon: string
		tooltip: (
			stats: Stats,
			upgrade: Upgrade,
			upgrades: Upgrade[]
		) => ReactNode
		cost: number
		effect: (stats: Stats, upgrade: Upgrade, upgrades: Upgrade[]) => Stats
	}

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

export const toggleActivation = (
	upgrade: Upgrade,
	upgrades: Upgrade[],
	connections: Connection[],
	stats: Stats
) => {
	const parentUpgrade = findDirectParent(upgrade, upgrades, connections)
	if (!parentUpgrade) return upgrades
	// const childrenUpgrades = findDirectChildren(upgrade, upgrades, connections)

	const isActivating = !upgrade.active
	const upgradeIndex = upgrades.findIndex((node) => node.id == upgrade.id)
	const canActivate =
		parentUpgrade.active && stats.usedPower + upgrade.cost <= stats.power
	if (isActivating)
		return upgrades.toSpliced(upgradeIndex, 1, {
			...upgrade,
			active: canActivate ? !upgrade.active : upgrade.active,
		})
	// const someChildrenUpgradesActive = childrenUpgrades.some(
	// 	(upgrade) => upgrade.active
	// )
	const allChildrenIds = findAllChildren(upgrade, upgrades, connections).map(
		(upgrade) => upgrade.id
	)
	return upgrades.map((u) => ({
		...u,
		...(allChildrenIds.includes(u.id) || u.id == upgrade.id
			? { active: false }
			: {}),
	}))
	// TODO: If we can no longer afford nodes, deactivate other nodes until we have money.
	// This could kill the fun in the game since unexpectedly things get destroyed.
	// Instead the player has to make room for resources or shift strategy - more fun
}
