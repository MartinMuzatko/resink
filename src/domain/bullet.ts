import { Position, Identifier } from './main'

export type Bullet = Position &
	Identifier & {
		velocity: {
			x: number
			y: number
		}
		enemyIdsHit: string[]
	}

export const createBullet = (bullet: Partial<Bullet>): Bullet => ({
	id: crypto.randomUUID(),
	x: 0,
	y: 0,
	velocity: {
		x: 0,
		y: 0,
	},
	enemyIdsHit: [],
	...bullet,
})
