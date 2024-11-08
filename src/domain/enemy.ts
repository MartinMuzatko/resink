import { getDistance, Identifier, lerpPosition, Position } from './main'
import { findFurthestUpgradePosition, Upgrade, UpgradeType } from './upgrade'

export const randomRange = (min: number, max: number) =>
	Math.random() * (max - min) + min
export const randomRangeInteger = (min: number, max: number) =>
	Math.round(randomRange(min, max))
export const randomArrayItem = <T>(array: T[]) =>
	array[randomRangeInteger(0, array.length - 1)]

export const findTarget = (upgrades: Upgrade[]) => {
	const activeUpgrades = upgrades.filter(
		(upgrade) => upgrade.active && upgrade.type == UpgradeType.upgrade
	)
	if (!activeUpgrades.length)
		return upgrades.find((upgrade) => upgrade.type == UpgradeType.motor)!
	return randomArrayItem(activeUpgrades)
}

export const getSpawnArea = (upgrades: Upgrade[]) => {
	const furthestPosition = findFurthestUpgradePosition(upgrades)
	const x = Math.abs(furthestPosition.x)
	const y = Math.abs(furthestPosition.y)
	const size = Math.max(x, y) + 2
	return {
		x: size * -1,
		y: size * -1,
		width: size * 2,
		height: size * 2,
	}
}

export const moveEnemy = (
	enemy: Enemy,
	upgrades: Upgrade[],
	deltaTime: number
) => {
	const currentTarget = upgrades.find((u) => u.id == enemy.target)!
	const target = currentTarget.active ? currentTarget : findTarget(upgrades)
	const distance = getDistance(enemy, target)
	const p = lerpPosition(
		enemy,
		{
			x: target.x,
			y: target.y,
		},
		(enemy.speed * deltaTime) / distance
	)
	return {
		...enemy,
		...p,
		target: target.id,
	}
}

export type Enemy = Identifier &
	Position & {
		target: string
		speed: number
		health: number
		maxHealth: number
	}
