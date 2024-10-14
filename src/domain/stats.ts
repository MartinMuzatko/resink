import { Upgrade } from './upgrade'

export type Stats = {
	power: number
	usedPower: number
	upgradeHealth: number
}

export const getStatsFromActiveUpgrades = (upgrades: Upgrade[]): Stats =>
	// @ts-ignore
	upgrades
		.filter((node) => node.active)
		.reduce<Stats>(
			// @ts-ignore
			(prev, cur) => {
				const stats = cur.effect(prev, cur, upgrades)
				return stats
			},
			{
				power: 0,
				usedPower: 0,
				upgradeHealth: 0,
			}
		)

export const hasNotEnoughPower = (stats: Stats) => stats.usedPower > stats.power
