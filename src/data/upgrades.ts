import { connection } from '../domain/connection'
import { getCost } from '../domain/stats'
import { createUpgrade, UpgradeType } from '../domain/upgrade'

export const INITIAL_UPGRADES = [
	createUpgrade({
		active: true,
		id: 'M',
		type: UpgradeType.motor,
		tooltip: (stats) =>
			`Motor ${stats.usedPower}/${stats.power} (${Math.max(
				stats.power - stats.usedPower,
				0
			)} left)`,
		effect: (stats) => ({ ...stats, power: stats.power + 10 }),
		icon: 'M',
		x: 0,
		y: 0,
	}),
	createUpgrade({
		id: 'A',
		tooltip: (stats) => '+1 Damage',
		cost: 5,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseDamage: stats.mouseDamage + 1,
		}),
		icon: 'A',
		x: 0,
		y: -1,
	}),
	createUpgrade({
		id: 'A1',
		tooltip: (stats) => '+10% Attack speed',
		cost: 10,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseAttackSpeed: stats.mouseAttackSpeed * 0.9,
		}),
		icon: 'A1',
		x: 0,
		y: -2,
	}),
	createUpgrade({
		id: 'AS2',
		tooltip: (stats) => '+20% Attack speed',
		cost: 20,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseAttackSpeed: stats.mouseAttackSpeed * 0.8,
		}),
		icon: 'AS2',
		x: 0,
		y: -3,
	}),
	createUpgrade({
		id: 'A2',
		tooltip: (stats) => '+2 Damage',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			power: stats.power + upgrades.filter((u) => u.active).length * 2,
		}),
		icon: 'A2',
		x: -1,
		y: -2,
	}),
	createUpgrade({
		id: 'A3',
		tooltip: (stats) => '+2 Damage',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			power: stats.power + upgrades.filter((u) => u.active).length * 2,
		}),
		icon: 'A3',
		x: 1,
		y: -2,
	}),
	createUpgrade({
		id: 'D',
		tooltip: (stats) => '+1 Health',
		cost: 4,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			health: stats.health + 1,
		}),
		icon: 'D',
		x: 0,
		y: 1,
	}),
	createUpgrade({
		id: 'L',
		tooltip: (stats) => '+1 Range',
		cost: 4,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
		}),
		icon: 'L',
		x: -1,
		y: 0,
	}),
	createUpgrade({
		id: 'U',
		tooltip: (stats) => '+1 Range',
		cost: 4,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			// health: stats.health + 1,
		}),
		icon: 'U',
		x: 1,
		y: 0,
	}),
]

export const INITIAL_CONNECTIONS = [
	connection('M', 'A'),
	connection('A', 'A1'),
	connection('A', 'A2'),
	connection('A', 'A3'),
	connection('A1', 'AS2'),
	connection('M', 'D'),
	connection('M', 'L'),
	connection('M', 'U'),
]
