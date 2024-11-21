import {
	equalPosition,
	getDistance,
	Identifier,
	lerpPosition,
	Position,
	randomArrayItem,
} from './main'
import { findFurthestUpgradePosition, Upgrade, UpgradeType } from './upgrade'

export type Enemy = Identifier &
	Position & {
		size: number
		target: string
		movementSpeed: number
		attackDamage: number
		attackSpeed: number
		lastAttackDealtTime: number
		health: number
		maxHealth: number
	}

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
	const newPosition = lerpPosition(
		enemy,
		{
			x: target.x,
			y: target.y,
		},
		(enemy.movementSpeed * deltaTime) / distance
	)
	return {
		...enemy,
		...newPosition,
		target: target.id,
	}
}

export const createEnemy = (enemy: Partial<Enemy>): Enemy => ({
	id: crypto.randomUUID(),
	x: 0,
	y: 0,
	movementSpeed: 0.0125,
	size: 1.25,
	attackDamage: 1,
	attackSpeed: 2000,
	health: 1,
	maxHealth: 1,
	lastAttackDealtTime: 0,
	target: 'none',
	...enemy,
})

export const canEnemyDealDamage = (
	enemy: Enemy,
	upgrade: Upgrade,
	timePassed: number
) =>
	equalPosition(upgrade, enemy) &&
	timePassed >= enemy.lastAttackDealtTime + enemy.attackSpeed
