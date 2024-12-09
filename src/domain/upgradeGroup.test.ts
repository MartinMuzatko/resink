import { expect, test } from 'vitest'
import { get8Bitmask } from './upgradeGroup'

test('create bitmask', () => {
	const fullCircle = get8Bitmask(
		[...Array(3)].flatMap((_, i) => [
			{ x: i + 1, y: 1 },
			{ x: i + 1, y: 2 },
			{ x: i + 1, y: 3 },
		])
	)
	expect(fullCircle).toBe(1 + 2 + 4 + 8 + 16 + 32 + 64 + 128)

	expect(get8Bitmask([])).toBe(0)
})

test('calculate borders from bitmasks')
