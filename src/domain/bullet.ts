import { Position, Identifier } from './main'

export type Bullet = Position &
	Identifier & {
		velocity: {
			x: number
			y: number
		}
		enemyIdsHit: string[]
	}
