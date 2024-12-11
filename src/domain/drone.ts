import { Identifier, Position } from './main'

enum DronTask {
	attackEnemies,
	healUpgrades,
	collectExperienceOrbs,
}

export type Drone = {
	damage: number
	health: number
	maxHealth: number
	movementSpeed: number
	attackSpeed: number
	healSpeed: number
	collectSpeed: number
	charge: number
	rechargeSpeed: number
	chargeUsageSpeed: number
	maxCharge: number
	task: DronTask
	target: Position
} & Position &
	Identifier
