import { Identifier, Position } from './main'
import { Upgrade, UpgradeType } from './upgrade'

export const randomRange = (min: number, max: number) =>
	Math.random() * (max - min) + min
export const randomRangeInteger = (min: number, max: number) =>
	Math.round(randomRange(min, max))
export const randomArrayItem = <T>(array: T[]) =>
	array[randomRangeInteger(0, array.length - 1)]

export const findTarget = (upgrades: Upgrade[]) => {
	const activeUpgrades = upgrades.filter(
		(upgrade) => upgrade.active && upgrade.type == UpgradeType.upgrade
	)
	if (!activeUpgrades.length)
		return upgrades.find((upgrade) => upgrade.type == UpgradeType.motor)!
	return randomArrayItem(activeUpgrades)
}

export type Enemy = Identifier &
	Position & {
		target: string
		speed: number
		health: number
	}
