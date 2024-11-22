import { connection } from '../domain/connection'
import { Stats } from '../domain/stats'
import { createUpgrade, UpgradeType } from '../domain/upgrade'
import {
	GiBarracks,
	GiBroadsword,
	GiHeavyBullets,
	GiPowerGenerator,
	GiSentryGun,
	GiStripedSword,
	GiSwordAltar,
	GiTurret,
} from 'react-icons/gi'
import { FaHeart, FaHeartbeat } from 'react-icons/fa'
import { GiResize } from 'react-icons/gi'
import { StatsInfoPlain } from '../components/StatsInfoPlain'
import { BiHeartSquare } from 'react-icons/bi'
import { LuExpand } from 'react-icons/lu'
import { AiOutlineReload } from 'react-icons/ai'
import { BsLightningChargeFill } from 'react-icons/bs'
import { CiDroplet } from 'react-icons/ci'
import { MdOutlineSell, MdOutlineShield } from 'react-icons/md'
import { TbRosetteDiscount } from 'react-icons/tb'

export const INITIAL_STATS: Stats = {
	maxPower: 10,
	powerMultiplier: 1,
	powerPerEnemy: 1,
	additionalPowerPerEnemyChance: 0.1,
	upgradeCostMultiplier: 1,
	upgradeHealth: 1,
	upgradeArmor: 0,
	mouseAttackDamage: 1,
	mouseHealAmount: 0,
	mouseSize: 1,
	mouseSpeed: 3000,
	upgradeHealthRegenerationAmount: 0,
	upgradeHealthRegenerationSpeed: 4000,
	upgradeBulletAttackDamage: 0,
	upgradeBulletMaxAmmo: 10,
	// tick based
	// TODO: make time based and per upgrade
	upgradeBulletAttackSpeed: 2000,
	upgradeBulletAttackRange: 1.5,
	upgradeBulletAmmoPrice: 0.5,
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
		cost: 2,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
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
			mouseSpeed: stats.mouseSpeed * 0.8,
		}),
		icon: <GiStripedSword className="w-full h-full" />,
		x: 0,
		y: -3,
	}),
	createUpgrade({
		id: 'AS3',
		cost: 20,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			mouseSpeed: stats.mouseSpeed * 0.6,
		}),
		icon: <GiStripedSword className="w-full h-full" />,
		x: 0,
		y: -4,
	}),
	createUpgrade({
		id: 'A2',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
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
			mouseAttackDamage: stats.mouseAttackDamage + 3,
		}),
		icon: <GiSwordAltar className="w-full h-full" />,
		x: 1,
		y: -2,
	}),
	createUpgrade({
		id: 'AT',
		title: 'Turn upgrades into turrets',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			upgradeBulletAttackDamage: stats.upgradeBulletAttackDamage + 1,
		}),
		icon: <GiTurret className="w-full h-full" />,
		x: 1,
		y: -3,
	}),
	createUpgrade({
		id: 'AT1',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			upgradeBulletAttackDamage: stats.upgradeBulletAttackDamage + 2,
		}),
		icon: <GiSentryGun className="w-full h-full" />,
		x: 1,
		y: -4,
	}),
	createUpgrade({
		id: 'AT2',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			upgradeBulletAttackSpeed: stats.upgradeBulletAttackSpeed * 0.8,
		}),
		icon: <AiOutlineReload className="w-full h-full" />,
		x: 2,
		y: -3,
	}),
	createUpgrade({
		id: 'AT3',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			upgradeBulletAttackRange: stats.upgradeBulletAttackRange + 1,
		}),
		icon: <LuExpand className="w-full h-full" />,
		x: 2,
		y: -4,
	}),
	createUpgrade({
		id: 'AT4',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			upgradeBulletMaxAmmo: stats.upgradeBulletMaxAmmo + 20,
		}),
		icon: <GiHeavyBullets className="w-full h-full" />,
		x: 3,
		y: -3,
	}),
	createUpgrade({
		id: 'AT5',
		cost: 15,
		effect: (stats, upgrade, upgrades) => ({
			...stats,
			upgradeBulletAmmoPrice: stats.upgradeBulletAmmoPrice - 0.15,
		}),
		icon: <MdOutlineSell className="w-full h-full" />,
		x: 4,
		y: -2,
	}),
	createUpgrade({
		id: 'D',
		cost: 6,
		effect: (stats, upgrade) => ({
			...stats,
			upgradeHealth: stats.upgradeHealth + 3,
		}),
		icon: <FaHeart className="w-full h-full" />,
		x: 1,
		y: 1,
	}),
	createUpgrade({
		id: 'D1',
		cost: 10,
		effect: (stats, upgrade) => ({
			...stats,
		}),
		icon: <FaHeartbeat className="w-full h-full" />,
		x: 0,
		y: 2,
	}),
	createUpgrade({
		id: 'D2',
		cost: 10,
		effect: (stats, upgrade) => ({
			...stats,
			upgradeArmor: stats.upgradeArmor + 1,
		}),
		icon: <MdOutlineShield className="w-full h-full" />,
		x: 1,
		y: 2,
	}),
	createUpgrade({
		id: 'D3',
		cost: 10,
		effect: (stats, upgrade) => ({
			...stats,
			mouseHealAmount: stats.mouseHealAmount + 1,
		}),
		icon: <BiHeartSquare className="w-full h-full" />,
		x: 2,
		y: 1,
	}),
	createUpgrade({
		id: 'L',
		cost: 8,
		effect: (stats, upgrade) => ({
			...stats,
			maxPower: stats.maxPower + 10,
		}),
		icon: <BsLightningChargeFill className="w-full h-full" />,
		x: -1,
		y: 1,
	}),
	createUpgrade({
		id: 'L1',
		title: 'Discount',
		cost: 10,
		effect: (stats, upgrade) => ({
			...stats,
			upgradeCostMultiplier: stats.upgradeCostMultiplier * 0.8,
		}),
		icon: <TbRosetteDiscount className="w-full h-full" />,
		x: -2,
		y: 0,
	}),
	createUpgrade({
		id: 'L2',
		cost: 10,
		title: 'Delicious',
		description: 'Get more out of the experience juice',
		effect: (stats, upgrade) => ({
			...stats,
			powerPerEnemy: stats.powerPerEnemy + 1,
			additionalPowerPerEnemyChance:
				stats.additionalPowerPerEnemyChance + 0.1,
		}),
		icon: <CiDroplet className="w-full h-full" />,
		x: -2,
		y: 1,
	}),
]

export const INITIAL_CONNECTIONS = [
	connection('M', 'A'),
	connection('A', 'A1'),
	connection('A', 'A2'),
	connection('A', 'A3'),
	connection('A1', 'AS2'),
	connection('AS2', 'AS3'),
	connection('A3', 'AT'),
	connection('AT', 'AT1'),
	connection('AT', 'AT2'),
	connection('AT', 'AT3'),
	connection('AT2', 'AT4'),
	connection('AT4', 'AT5'),
	connection('M', 'D'),
	connection('D', 'D1'),
	connection('D', 'D2'),
	connection('D', 'D3'),
	connection('M', 'L'),
	connection('L', 'L1'),
	connection('L', 'L2'),
]
