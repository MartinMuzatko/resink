import { expect, test } from 'vitest'
import { getActiveStats } from './stats'
import { createUpgrade } from './upgrade'
import { INITIAL_STATS } from '../data/initialGameData'

test('stats filter where filter is true', () => {
	const testUpgrade = createUpgrade({
		id: '1',
		active: true,
		effect: (stats) => ({
			upgradeArmor: {
				value: stats.upgradeArmor + 1,
				filter: () => true,
			},
		}),
	})
	expect(
		getActiveStats([testUpgrade], [], { ...INITIAL_STATS, upgradeArmor: 0 })
	).toStrictEqual({
		...INITIAL_STATS,
		upgradeArmor: 1,
	})
})

test('stats filter where filter is false', () => {
	const testUpgrade = createUpgrade({
		id: '1',
		active: true,
		effect: (stats) => ({
			upgradeArmor: {
				value: stats.upgradeArmor + 1,
				filter: () => false,
			},
		}),
	})
	expect(
		getActiveStats([testUpgrade], [], { ...INITIAL_STATS, upgradeArmor: 0 })
	).toStrictEqual({
		...INITIAL_STATS,
		upgradeArmor: 0,
	})
})
