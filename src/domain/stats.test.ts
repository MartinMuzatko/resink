import { expect, test } from 'vitest'
import {
	addStats,
	getActiveStats,
	getUpgradeDisplayStats,
	mergeStats,
} from './stats'
import { createUpgrade } from './upgrade'
import { INITIAL_STATS, INITIAL_UPGRADES } from '../data/initialGameData'

test('calculate stats for global', () => {
	const x = getActiveStats(
		[
			createUpgrade({
				id: 'A',
				active: true,
				effect: [
					{
						stats: (stats) => ({
							upgradeArmor: stats.upgradeArmor + 1,
						}),
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
		upgradeStats: new Map([['A', { ...INITIAL_STATS, upgradeArmor: 3 }]]),
	})
})

test('calculate stats for upgrade', () => {
	const stats = getActiveStats(
		[
			createUpgrade({
				active: true,
				id: 'A',
				effect: [
					{
						stats: (stats) => ({
							upgradeArmor: stats.upgradeArmor + 32,
						}),
					},
					{
						stats: (stats) => ({
							upgradeArmor: stats.upgradeArmor + 64,
						}),
					},
				],
			}),
			createUpgrade({
				active: true,
				id: 'B',
				effect: [
					{
						filter: (upgrade) => upgrade.id === 'A',
						stats: (stats) => ({
							upgradeArmor: stats.upgradeArmor + 4,
						}),
					},
					{
						filter: (upgrade) => upgrade.id === 'A',
						stats: (stats) => ({
							upgradeArmor: stats.upgradeArmor + 8,
						}),
					},
					{
						filter: (upgrade) => upgrade.id === 'A',
						stats: (stats) => ({
							upgradeArmor: stats.upgradeArmor + 16,
						}),
					},
				],
			}),
		],
		[],
		{ ...INITIAL_STATS, upgradeArmor: 1 }
	)
	expect(stats).toStrictEqual({
		globalStats: {
			...INITIAL_STATS,
			upgradeArmor: 1 + 32 + 64,
		},
		upgradeStats: new Map([
			[
				'A',
				{
					...INITIAL_STATS,
					upgradeArmor: 1 + 32 + 64 + 4 + 8 + 16,
				},
			],
			[
				'B',
				{
					...INITIAL_STATS,
					upgradeArmor: 1 + 32 + 64,
				},
			],
		]),
	})
})

test.only('display stats', () => {
	const upgradeA = createUpgrade({
		active: true,
		id: 'A',
		effect: [
			{
				stats: (stats) => ({
					upgradeArmor: stats.upgradeArmor + 1,
				}),
			},
			{
				stats: (stats) => ({
					upgradeArmor: stats.upgradeArmor + 1,
				}),
			},
		],
	})
	const upgradeB = createUpgrade({
		active: false,
		id: 'B',
		effect: [
			{
				filter: (upgrade) => upgrade.id === 'A',
				stats: (stats) => ({
					upgradeArmor: stats.upgradeArmor + 3,
				}),
			},
			{
				stats: (stats) => ({
					upgradeArmor: stats.upgradeArmor + 1,
				}),
			},
		],
	})
	const stats = getActiveStats([upgradeA, upgradeB], [], {
		...INITIAL_STATS,
	})
	const x = getUpgradeDisplayStats(
		upgradeB,
		[upgradeA, upgradeB],
		[],
		{
			...INITIAL_STATS,
		},
		stats
	)

	expect(x).toStrictEqual({})
})

test('merge stats', () => {
	const result = mergeStats(
		{ ...INITIAL_STATS, mouseSize: 1 },
		{ mouseSize: 3 }
	)
	expect(result).toStrictEqual({ ...INITIAL_STATS, mouseSize: 3 })
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
