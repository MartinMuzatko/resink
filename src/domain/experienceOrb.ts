import {
	clamp,
	getDistance,
	Identifier,
	lerp,
	lerpPosition,
	Position,
	subPosition,
} from './main'

export type ExperienceOrb = Identifier &
	Position & {
		amount: number
	}

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

export function attractOrb(
	point: Position,
	target: Position,
	deltaTime: number
): Position {
	const distance = getDistance(point, target)
	if (distance === 0) return point
	const t = clamp(0, 5)(distance) / 5
	const step = lerp(0.04, 0, t * t)
	const newPosition = lerpPosition(
		point,
		target,
		(step * deltaTime) / distance
	)
	return newPosition
}
