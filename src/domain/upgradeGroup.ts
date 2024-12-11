import { ReactNode } from 'react'
import { Area, Identifier, Position } from './main'
import { Upgrade } from './upgrade'

export type UpgradeGroup = {
	icon: ReactNode
	title: ReactNode
} & Identifier

type BitmaskPosition = {
	bitmask: number
} & Position

// const borderMap = () =>

const getBorderForUpgrade = (positions: Position[]) => {
	positions.map((p) => get8Bitmask(p))
}

const getBordersForBitmask = (bitmasks: BitmaskPosition[]) => {}

/**
 * 1. start at an outer corner
 * 2. follow along clockwise
 */

const getNeighbouringPositions = (
	position: Position,
	positions: Position[]
): Position[] =>
	positions.filter(
		(p) =>
			(p.x === position.x - 1 && p.y === position.y - 1) ||
			(p.x === position.x && p.y === position.y - 1) ||
			(p.x === position.x + 1 && p.y === position.y - 1) ||
			(p.x === position.x - 1 && p.y === position.y) ||
			(p.x === position.x && p.y === position.y) ||
			(p.x === position.x + 1 && p.y === position.y) ||
			(p.x === position.x - 1 && p.y === position.y + 1) ||
			(p.x === position.x && p.y === position.y + 1) ||
			(p.x === position.x + 1 && p.y === position.y + 1)
	)

const getBitmasks = (positions: Position[]) =>
	positions.map((position) =>
		get8Bitmask(getNeighbouringPositions(position, positions))
	)

export const get8Bitmask = (positions: Position[]): number =>
	positions
		.filter(
			({ x, y }) =>
				x >= 1 && x <= 3 && y >= 1 && y <= 3 && !(x === 2 && y === 2)
		)
		.reduce((mask, { x, y }) => {
			const originalIndex = (y - 1) * 3 + (x - 1)
			const adjustedIndex =
				originalIndex > 4 ? originalIndex - 1 : originalIndex
			return mask | (1 << adjustedIndex)
		}, 0)

const x = get8Bitmask([{ x: 1, y: 1 }])
