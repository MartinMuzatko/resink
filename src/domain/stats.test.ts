import { expect, test } from 'vitest'
import {
	addStats,
	diffStats,
	getActiveStats,
	getUpgradeDisplayStats,
	mergeStats,
	reduceStatsEffects,
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

test('stats dont override each other', () => {
	const upgradeM = createUpgrade({
		active: true,
		id: 'M',
		effect: [],
	})
	const upgradeA = createUpgrade({
		active: true,
		id: 'A',
		effect: [
			{
				filter: (upgrade) => upgrade.id === 'M',
				stats: (stats) => ({
					upgradeBulletAttackDamage:
						stats.upgradeBulletAttackDamage + 1,
				}),
			},
		],
	})
	const upgradeL = createUpgrade({
		active: true,
		id: 'L',
		effect: [
			{
				filter: (upgrade) => upgrade.id === 'L',
				stats: (stats) => ({
					upgradePowerGenerationAmount:
						stats.upgradePowerGenerationAmount + 1,
				}),
			},
		],
	})
	const stats = getActiveStats(
		[upgradeM, upgradeA, upgradeL],
		[],
		INITIAL_STATS
	)
	expect(stats).toStrictEqual({
		globalStats: INITIAL_STATS,
		upgradeStats: new Map([
			[
				'M',
				{
					...INITIAL_STATS,
					upgradeBulletAttackDamage: 1,
				},
			],
			['A', INITIAL_STATS],
			[
				'L',
				{
					...INITIAL_STATS,
					upgradePowerGenerationAmount: 1,
				},
			],
		]),
	})
})

test('accumulate upgrade filtered stats', () => {
	const upgradeM = createUpgrade({
		active: true,
		id: 'M',
		effect: [],
	})
	const upgradeA = createUpgrade({
		active: true,
		id: 'A',
		effect: [
			{
				filter: (upgrade) => upgrade.id === 'M',
				stats: (stats) => ({
					upgradeBulletAttackDamage:
						stats.upgradeBulletAttackDamage + 1,
				}),
			},
		],
	})
	const upgradeL = createUpgrade({
		active: true,
		id: 'L',
		effect: [
			{
				filter: (upgrade) => upgrade.id === 'L',
				stats: (stats) => ({
					upgradePowerGenerationAmount:
						stats.upgradePowerGenerationAmount + 1,
				}),
			},
		],
	})
	const upgrades = [upgradeM, upgradeA, upgradeL]
	const stats = getActiveStats(upgrades, [], INITIAL_STATS)
	const first = reduceStatsEffects(
		upgrades,
		new Map(upgrades.map((u) => [u.id, stats.globalStats])),
		upgradeA.effect[0],
		stats.globalStats,
		[]
	)
	expect(first).toStrictEqual(
		new Map([
			['M', { ...INITIAL_STATS, upgradeBulletAttackDamage: 1 }],
			['A', { ...INITIAL_STATS }],
			['L', { ...INITIAL_STATS }],
		])
	)
	const second = reduceStatsEffects(
		upgrades,
		first,
		upgradeL.effect[0],
		stats.globalStats,
		[]
	)
	expect(second).toStrictEqual(
		new Map([
			['M', { ...INITIAL_STATS, upgradeBulletAttackDamage: 1 }],
			['A', { ...INITIAL_STATS }],
			['L', { ...INITIAL_STATS, upgradePowerGenerationAmount: 1 }],
		])
	)
})

test('display stats', () => {
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
	const blankStats = diffStats(INITIAL_STATS, INITIAL_STATS)

	expect(x).toStrictEqual({
		globalStats: {
			...blankStats,
			upgradeArmor: 1,
		},
		upgradeStats: new Map([
			[
				'A',
				{
					...blankStats,
					upgradeArmor: 4,
				},
			],
		]),
	})
})

test.only('display stats for purchased upgrades', () => {
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
		active: true,
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
	const blankStats = diffStats(INITIAL_STATS, INITIAL_STATS)

	expect(x).toStrictEqual({
		globalStats: {
			...blankStats,
			upgradeArmor: 1,
		},
		upgradeStats: new Map([
			[
				'A',
				{
					...blankStats,
					upgradeArmor: 4,
				},
			],
		]),
	})
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
