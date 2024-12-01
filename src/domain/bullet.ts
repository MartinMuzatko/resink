import { Position, Identifier, isPositionInsideArea } from './main'

export type Bullet = Position &
	Identifier & {
		velocity: {
			x: number
			y: number
		}
		attackDamage: number
		enemyIdsHit: string[]
	}

export const createBullet = (bullet: Partial<Bullet>): Bullet => ({
	id: crypto.randomUUID(),
	x: 0,
	y: 0,
	attackDamage: 1,
	velocity: {
		x: 0,
		y: 0,
	},
	enemyIdsHit: [],
	...bullet,
})

export const moveBullets = (bullets: Bullet[]) =>
	bullets
		.map((bullet) => ({
			...bullet,
			x: bullet.x + bullet.velocity.x,
			y: bullet.y + bullet.velocity.y,
		}))
		.filter((bullet) =>
			isPositionInsideArea(bullet, {
				x: -10,
				y: -10,
				width: 20,
				height: 20,
			})
		)
