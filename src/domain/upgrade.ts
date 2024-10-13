import { ReactNode } from 'react'
import { Identifier, Position } from './main'
import { Connection } from './connection'

export enum UpgradeType {
	motor,
	upgrade,
}

export type UpgradeEffect = {
	maxPower: number
	usedPower: number
}

export type Upgrade = Identifier &
	Position & {
		type: UpgradeType
		active: boolean
		icon: string
		tooltip: (stats: UpgradeEffect) => ReactNode
		cost: number
		effect: (stats: UpgradeEffect) => UpgradeEffect
	}

export const findChildren = (
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

export const findParent = (
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
