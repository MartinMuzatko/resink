import { Identifier, lerp, parabolicEase, Position } from './main'

export type DamageIndicator = {
	value: number
	createdTime: number
	current: Position
	origin: Position
	className: string
} & Identifier

export const createDamageIndicator = (
	damageIndicator: Partial<DamageIndicator> &
		Pick<DamageIndicator, 'createdTime'>
): DamageIndicator => ({
	id: crypto.randomUUID(),
	value: 1,
	origin: {
		x: 0,
		y: 0,
	},
	current: {
		x: 0,
		y: 0,
	},
	className: '',
	...damageIndicator,
})

export const getDamageIndicatorElapsedTimeFactor = (
	damageIndicator: DamageIndicator,
	timePassed: number
) =>
	Math.min(
		(timePassed - damageIndicator.createdTime) /
			MAX_DAMAGE_INDICATOR_DURATION,
		1
	)

export const MAX_DAMAGE_INDICATOR_DURATION = 750
export const moveDamageIndicator = (
	damageIndicator: DamageIndicator,
	timePassed: number
) => {
	const { x, y } = damageIndicator.origin
	const t = getDamageIndicatorElapsedTimeFactor(damageIndicator, timePassed)
	return {
		...damageIndicator,
		current: {
			x: lerp(x, x + 1 / 2, t),
			y: lerp(y, y - 1, parabolicEase(t)),
		},
	}
}
