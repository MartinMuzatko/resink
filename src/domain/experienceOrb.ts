import { Enemy } from './enemy'
import { randomRange, randomRangeInteger } from './main'
import {
	clamp,
	getDistance,
	Identifier,
	lerp,
	lerpPosition,
	Position,
	subPosition,
} from './main'
import { Stats, StatsEffectResult } from './stats'

export enum ExperienceOrbSource {
	enemy,
	upgrade,
}

export type ExperienceOrb = Identifier &
	Position & {
		amount: number
		source: ExperienceOrbSource
	}

export const createExperienceOrb = (
	experienceOrb: Partial<ExperienceOrb>
): ExperienceOrb => ({
	amount: 1,
	source: ExperienceOrbSource.enemy,
	id: crypto.randomUUID(),
	x: 0,
	y: 0,
	...experienceOrb,
})

export function spiralInwards(point: Position, target: Position): Position {
	const difference = subPosition(point, target)
	const distance = getDistance(point, target)
	const angle = Math.atan2(difference.y, difference.x)
	const distanceStep = lerp(0.4, 0, clamp(0, 5)(distance) / 5)
	const moveDistance = Math.max(distanceStep, 0)
	const newAngle = angle + lerp(0.4, 0, clamp(0, 5)(distance) / 5)
	const x =
		target.x + Math.max(0, distance - moveDistance) * Math.cos(newAngle)
	const y =
		target.y + Math.max(0, distance - moveDistance) * Math.sin(newAngle)
	return {
		x,
		y,
	}
}

export const attractOrb = (
	point: Position,
	target: Position,
	deltaTime: number,
	stats: Stats
): Position => {
	const distance = getDistance(point, target)
	if (distance === 0) return point
	const t =
		clamp(0, stats.experienceOrbAttractionRadius)(distance) /
		stats.experienceOrbAttractionRadius
	// TODO: allow speed to be adjusted via stats
	const step = lerp(0.04, 0, t * t)
	const newPosition = lerpPosition(
		point,
		target,
		(step * deltaTime) / distance
	)
	return newPosition
}

export const createExperienceOrbsOnEnemiesKilled = (
	enemiesKilled: Enemy[],
	stats: StatsEffectResult
) => {
	return enemiesKilled.flatMap((enemy) => {
		return [
			...Array(randomRangeInteger(1, stats.globalStats.powerPerEnemy)),
		].map(() =>
			createExperienceOrb({
				amount: 1,
				x: enemy.x,
				y: enemy.y,
			})
		)
	})
}

export const distributePointOnCircle = (
	totalPoints: number,
	pointIndex: number,
	radius: number = 1
): { x: number; y: number } => {
	const angle = pointIndex * ((2 * Math.PI) / totalPoints)
	return {
		x: radius * Math.cos(angle),
		y: radius * Math.sin(angle),
	}
}
