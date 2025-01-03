import { expect, test } from 'vitest'
import {
	getBoundaryPath,
	getNextNeighbor,
	traceBoundary,
} from './boundaryTracing'

test('get next neighbor in a closed structure', () => {
	const grid = [
		{ x: 0, y: 1 },
		{ x: 1, y: 0 },
		{ x: 2, y: 0 },
		{ x: 2, y: 1 },
		{ x: 1, y: 2 },
	]
	// s = start
	// x = tile
	// . = empty
	// .xx
	// s.x
	// .x.
	// 7 0 1
	// 6 . 2
	// 5 4 3
	expect(getNextNeighbor(grid, grid[0], 0)).toStrictEqual({
		position: { x: 1, y: 0 },
		direction: 1,
		freeDirections: [5, 6, 7, 0],
	})
	expect(getNextNeighbor(grid, grid[1], 1)).toStrictEqual({
		position: { x: 2, y: 0 },
		direction: 2,
		freeDirections: [6, 7, 0, 1],
	})
	expect(getNextNeighbor(grid, grid[2], 2)).toStrictEqual({
		position: { x: 2, y: 1 },
		direction: 4,
		freeDirections: [7, 0, 1, 2, 3],
	})
	expect(getNextNeighbor(grid, grid[3], 4)).toStrictEqual({
		position: { x: 1, y: 2 },
		direction: 5,
		freeDirections: [1, 2, 3, 4],
	})
	expect(getNextNeighbor(grid, grid[4], 5)).toStrictEqual({
		position: grid[0],
		direction: 7,
		freeDirections: [2, 3, 4, 5, 6],
	})
})

test('get next neighbor in a looping back structure', () => {
	const grid = [
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: 2, y: 0 },
	]
	// xxx
	expect(getNextNeighbor(grid, grid[0], 0)).toStrictEqual({
		position: { x: 1, y: 0 },
		direction: 2,
		freeDirections: [5, 6, 7, 0, 1],
	})
	expect(getNextNeighbor(grid, grid[1], 2)).toStrictEqual({
		position: { x: 2, y: 0 },
		direction: 2,
		freeDirections: [7, 0, 1],
	})
	expect(getNextNeighbor(grid, grid[2], 2)).toStrictEqual({
		position: { x: 1, y: 0 },
		direction: 6,
		freeDirections: [7, 0, 1, 2, 3, 4, 5],
	})
	// expect(getNextNeighbor(grid, grid[3], 4)).toStrictEqual({
	// 	position: { x: 2, y: 0 },
	// 	direction: 6,
	// })
})

test('get boundary', () => {
	const grid = [
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: 1, y: 1 },
	]
	expect(traceBoundary(grid, grid[0])).toStrictEqual([
		{
			direction: 2,
			position: grid[0],
		},
		{
			direction: 4,
			position: grid[1],
		},
		{
			direction: 7,
			position: grid[2],
		},
	])
})

test('get boundary path', () => {
	const grid = [
		{ x: 0, y: 0 },
		{ x: 1, y: 0 },
		{ x: 1, y: 1 },
	]
	console.log('b:', getBoundaryPath(grid))
	expect(getBoundaryPath(grid).length).toBe(13)
})
