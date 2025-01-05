import {
	addPosition,
	Area,
	equalPosition,
	generateRandomPositionOnEdge,
	getDistance,
	getVectorAngleDegrees,
	Identifier,
	lerpPosition,
	mulPosition,
	normalizeVector,
	Position,
	randomArrayItem,
	subPosition,
} from './main'
import { findFurthestUpgradePosition, Upgrade, UpgradeType } from './upgrade'

export enum EnemyType {
	wobbler,
	straight,
}

export type Enemy = Identifier &
	Position & {
		size: number
		target: string
		movementSpeed: number
		attackDamage: number
		attackSpeed: number
		lastAttackDealtTime: number
		lastMovementTime: number
		health: number
		maxHealth: number
		rotation: number
		type: EnemyType
	}

export const findTarget = (upgrades: Upgrade[]) => {
	const activeUpgrades = upgrades.filter(
		(upgrade) => upgrade.active && upgrade.type == UpgradeType.upgrade
	)
	if (!activeUpgrades.length)
		return upgrades.find((upgrade) => upgrade.type == UpgradeType.motor)!
	return randomArrayItem(activeUpgrades)
}

export const getAreaFromEnemy = (enemy: Enemy): Area => ({
	x: enemy.x,
	y: enemy.y,
	width: enemy.size,
	height: enemy.size,
})

export const getSpawnArea = (upgrades: Upgrade[]): Area => {
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
const wobbleFrequency = 0.002
const wobbleAmplitude = 0.03
const addWobbleMovePattern = (
	enemyPosition: Position,
	target: Position,
	timePassed: number
) => {
	// Calculate wobble offset directly from game time
	const wobbleOffset = timePassed * wobbleFrequency

	// Calculate direction to target
	const targetDirection = normalizeVector(subPosition(enemyPosition, target))

	// Calculate perpendicular wobble vector
	const perpVector = {
		x: -targetDirection.y, // Rotate 90 degrees
		y: targetDirection.x,
	}

	// TODO: Something wrong with rotation on wobbly enemies
	const wobbleAmount = Math.sin(wobbleOffset) * wobbleAmplitude
	const newPosition = addPosition(
		enemyPosition,
		mulPosition(perpVector, wobbleAmount)
	)
	return newPosition
}

export const moveEnemy = (
	enemy: Enemy,
	upgrades: Upgrade[],
	timePassed: number
) => {
	const currentTarget = upgrades.find((u) => u.id == enemy.target)!
	const target = currentTarget.active ? currentTarget : findTarget(upgrades)
	const distance = getDistance(enemy, target)
	const deltaTime = timePassed - enemy.lastMovementTime
	const newPosition = lerpPosition(
		enemy,
		{
			x: target.x,
			y: target.y,
		},
		(enemy.movementSpeed * deltaTime) / distance
	)
	const position =
		enemy.type == EnemyType.straight
			? newPosition
			: addWobbleMovePattern(newPosition, target, timePassed)
	// const newestPosition = addWobbleMovePattern(newPosition, target, timePassed)
	const vector = subPosition(position, enemy)
	return {
		...enemy,
		...position,
		lastMovementTime: timePassed,
		rotation: getVectorAngleDegrees(normalizeVector(vector)),
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
	lastMovementTime: 0,
	target: 'none',
	rotation: 0,
	type: EnemyType.straight,
	...enemy,
})

export const canEnemyDealDamage = (
	enemy: Enemy,
	upgrade: Upgrade,
	timePassed: number
) =>
	equalPosition(upgrade, enemy) &&
	timePassed >= enemy.lastAttackDealtTime + enemy.attackSpeed

export enum WaveState {
	ongoing = 'ongoing',
	idle = 'idle',
}

export const spawnEnemies = (
	enemies: Enemy[],
	upgrades: Upgrade[],
	amountEnemies: number,
	waveState: WaveState,
	wave: number,
	spawnArea: Area,
	timePassed: number
) =>
	waveState == WaveState.ongoing && enemies.length < amountEnemies
		? [
				...Array(
					Math.min(amountEnemies - enemies.length, amountEnemies)
				),
		  ].map(() =>
				createEnemy({
					...generateRandomPositionOnEdge(spawnArea),
					target: findTarget(upgrades).id,
					attackSpeed: 2000,
					attackDamage: 1 + Math.floor(wave / 3),
					lastMovementTime: timePassed,
					...(Math.random() > 0.9
						? {
								type: EnemyType.wobbler,
								movementSpeed: 0.001,
						  }
						: {
								type: EnemyType.straight,
								movementSpeed: 0.0005,
						  }),
					size: 0.25,
					health: 1 + Math.ceil(wave / 3),
					maxHealth: 1 + Math.ceil(wave / 3),
				})
		  )
		: []
