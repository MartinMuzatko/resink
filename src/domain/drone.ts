import { Position } from 'postcss'
import { Identifier } from './main'

enum DronTask {
	attackEnemies,
	healUpgrades,
	collectExperienceOrbs,
}

export type Drone = {
	damage: number
	health: number
	movementSpeed: number
	attackSpeed: number
	healSpeed: number
	collectSpeed: number
	task: DronTask
} & Position &
	Identifier
