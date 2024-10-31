import { connection } from '../domain/connection'
import { getCost, Stats } from '../domain/stats'
import { createUpgrade, UpgradeType } from '../domain/upgrade'
import { BsLightningChargeFill } from 'react-icons/bs'
import { GiBarracks, GiBroadsword, GiStripedSword } from 'react-icons/gi'
import { FaHeart } from 'react-icons/fa'
import { GiResize } from 'react-icons/gi'

export const INITIAL_STATS: Stats = {
	power: 100,
	usedPower: 0,
	powerMultiplier: 1,
	upgradeCostMultiplier: 1,
	globalHealth: 1,
	globalArmor: 0,
	upgradeHealth: 0,
	upgradeArmor: 0,
	mouseDamage: 1,
	mouseSize: 1,
	mouseAttackSpeed: 4000,
}

export const INITIAL_UPGRADES = [
	createUpgrade({
		active: true,
		id: 'M',
		type: UpgradeType.motor,
		title: 'Main Engine',
		description: 'Defend at all cost',
		tooltip: (stats) => (
			<div>
				<span className="text-blue-600">Power</span> + 10
				<br />
				<span className="text-green-600">Health</span> + 1<br />
				<span className="text-red-600">Damage</span> + 1<br />
				<span className="text-amber-600">Size</span> + 1<br />
				<span className="text-teal-400">Attack Speed</span> 100%
				<br />
			</div>
		),
		effect: (stats) => ({
			...stats,
		}),
		icon: <GiBarracks className="w-full h-full" />,
		x: 0,
		y: 0,
	}),
	createUpgrade({
		id: 'A',
		cost: 5,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseDamage: stats.mouseDamage + 1,
		}),
		icon: <GiBroadsword className="w-full h-full" />,
		x: 0,
		y: -1,
	}),
	createUpgrade({
		id: 'A1',
		cost: 10,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseAttackSpeed: stats.mouseAttackSpeed * 0.9,
		}),
		icon: <GiStripedSword className="w-full h-full" />,
		x: 0,
		y: -2,
	}),
	createUpgrade({
		id: 'AS2',
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
		id: 'AS3',
		cost: 20,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseAttackSpeed: stats.mouseAttackSpeed * 0.7,
		}),
		icon: 'AS2',
		x: 1,
		y: -3,
	}),
	createUpgrade({
		id: 'A2',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseSize: stats.mouseSize * 1.5,
		}),
		icon: <GiResize className="w-full h-full" />,
		x: -1,
		y: -2,
	}),
	createUpgrade({
		id: 'A3',
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
		cost: 4,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			globalHealth: stats.globalHealth + 1,
		}),
		icon: <FaHeart className="w-full h-full" />,
		x: 0,
		y: 1,
	}),
	createUpgrade({
		id: 'L',
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
	connection('AS2', 'AS3'),
	connection('M', 'D'),
	connection('M', 'L'),
	connection('M', 'U'),
]
