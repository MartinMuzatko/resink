import { expect, test } from 'vitest'
import { addStats, getActiveStats, mergeStats } from './stats'
import { createUpgrade } from './upgrade'
import { INITIAL_STATS } from '../data/initialGameData'

test('calculate stats for global', () => {
	const x = getActiveStats(
		[
			createUpgrade({
				active: true,
				effect: (stats) => [
					{
						stats: {
							upgradeArmor: stats.upgradeArmor + 1,
						},
					},
				],
			}),
		],
		[],
		{ ...INITIAL_STATS, upgradeArmor: 2 }
	)
	expect(x).toStrictEqual({
		globalStats: {
			...INITIAL_STATS,
			upgradeArmor: 3,
		},
		upgradeStats: new Map(),
	})
})

test('calculate stats for upgrade', () => {
	const x = getActiveStats(
		[
			createUpgrade({
				active: true,
				id: 'A',
				effect: (stats) => [
					{
						stats: {
							upgradeArmor: stats.upgradeArmor + 3,
						},
					},
				],
			}),
			createUpgrade({
				active: true,
				id: 'B',
				effect: (stats) => [
					{
						filter: (upgrade) => upgrade.id === 'A',
						stats: {
							upgradeArmor: stats.upgradeArmor + 5,
						},
					},
				],
			}),
		],
		[],
		{ ...INITIAL_STATS, upgradeArmor: 2 }
	)
	expect(x).toStrictEqual({
		globalStats: {
			...INITIAL_STATS,
			upgradeArmor: 5,
		},
		upgradeStats: new Map([
			[
				'A',
				{
					upgradeArmor: 10,
				},
			],
		]),
	})
})

test('merge stats', () => {
	const result = mergeStats({ mouseSize: 1 }, { mouseSize: 3 })
	expect(result).toStrictEqual({ mouseSize: 3 })
})

test('add stats', () => {
	const result = addStats(
		{
			maxPower: 1,
		},
		{
			bulletMaxAmmo: 1,
		}
	)
	expect(result).toStrictEqual({
		maxPower: 1,
		bulletMaxAmmo: 1,
	})
})
