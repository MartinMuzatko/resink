import { connection } from '../domain/connection'
import { getCost, Stats } from '../domain/stats'
import { createUpgrade, UpgradeType } from '../domain/upgrade'
import {
	GiBarracks,
	GiBroadsword,
	GiStripedSword,
	GiTurret,
} from 'react-icons/gi'
import { FaHeart, FaHeartbeat } from 'react-icons/fa'
import { GiResize } from 'react-icons/gi'
import { StatsInfoPlain } from '../components/StatsInfoPlain'
import { BiHeartSquare } from 'react-icons/bi'

export const INITIAL_STATS: Stats = {
	power: 20,
	maxPower: 20,
	usedPower: 0,
	powerMultiplier: 1,
	upgradeCostMultiplier: 1,
	globalHealth: 1,
	globalArmor: 0,
	upgradeHealth: 0,
	upgradeArmor: 0,
	mouseAttackDamage: 1,
	mouseHealAmount: 0,
	mouseSize: 1,
	mouseSpeed: 3000,
	globalHealthRegenerationAmount: 0,
	globalHealthRegenerationSpeed: 4000,
	upgradeBulletAttackDamage: 0,
	// tick based
	// TODO: make time based and per upgrade
	upgradeBulletAttackSpeed: 30,
	upgradeBulletAttackRange: 3,
}

export const INITIAL_UPGRADES = () => [
	createUpgrade({
		active: true,
		id: 'M',
		type: UpgradeType.motor,
		title: 'Main Engine',
		description: 'Defend at all cost',
		tooltip: (stats) => (
			<div>
				<StatsInfoPlain
					{...{
						stats: {
							...INITIAL_STATS,
							mouseSpeed: 0,
							mouseSize: 0,
						},
					}}
				/>
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
			mouseAttackDamage: stats.mouseAttackDamage + 1,
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
			mouseSpeed: stats.mouseSpeed * 0.9,
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
			mouseSpeed: stats.mouseSpeed * 0.8,
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
			mouseSpeed: stats.mouseSpeed * 0.7,
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
		title: 'Turn upgrades into turrets',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			upgradeBulletAttackDamage: stats.upgradeBulletAttackDamage + 1,
		}),
		icon: <GiTurret className="w-full h-full" />,
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
		id: 'D1',
		cost: 10,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
		}),
		icon: <FaHeartbeat className="w-full h-full" />,
		x: -1,
		y: 2,
	}),
	createUpgrade({
		id: 'D3',
		cost: 10,
		effect: (stats, upgrade) => ({
			...stats,
			usedPower: stats.usedPower + getCost(stats, upgrade),
			mouseHealAmount: stats.mouseHealAmount + 1,
		}),
		icon: <BiHeartSquare className="w-full h-full" />,
		x: 1,
		y: 2,
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
	connection('D', 'D1'),
	connection('D', 'D3'),
	connection('M', 'L'),
	connection('M', 'U'),
]
