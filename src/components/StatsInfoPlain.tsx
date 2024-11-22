import { INITIAL_STATS } from '../data/initialGameData'
import { Stats } from '../domain/stats'

type StatsInfoProps = {
	stats: Stats
}
// TODO: decide whether to show relative or absolute stats
export const StatsInfoPlain = ({ stats }: StatsInfoProps) => {
	return (
		<div>
			{(stats.mouseAttackDamage !== 0 ||
				stats.mouseSize !== 0 ||
				stats.mouseHealAmount !== 0 ||
				stats.mouseSpeed !== 0) && (
				<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
					Global Stats
				</div>
			)}
			{/* TODO: current stats display and changes in two diff. components.
			Also: automated display based on json, e.g. { displayType: percentage, color, } */}

			{stats.maxPower !== 0 && (
				<div>
					<span className="text-blue-800">Max Power</span> +{' '}
					{stats.maxPower}
				</div>
			)}
			{stats.powerPerEnemy !== 0 && (
				<div>
					<span className="text-cyan-400">Power per Enemy</span> +{' '}
					{stats.powerPerEnemy}
				</div>
			)}
			{stats.additionalPowerPerEnemyChance !== 0 && (
				<div>
					<span className="text-amber-600">
						Chance to get additional power
					</span>{' '}
					+{' '}
					{Math.floor(
						Math.abs(
							stats.additionalPowerPerEnemyChance /
								INITIAL_STATS.additionalPowerPerEnemyChance
						) * 10
					)}
					%
				</div>
			)}

			{stats.mouseAttackDamage !== 0 && (
				<div>
					<span className="text-red-600">Area Damage</span> +{' '}
					{stats.mouseAttackDamage}
				</div>
			)}
			{stats.mouseHealAmount !== 0 && (
				<div>
					<span className="text-lime-400">Area Heal</span> +{' '}
					{stats.mouseHealAmount}
				</div>
			)}
			{stats.mouseSize !== 0 && (
				<div>
					<span className="text-amber-600">Area Size</span> +{' '}
					{Math.floor(
						Math.abs(stats.mouseSize / INITIAL_STATS.mouseSize) *
							100
					)}
					%
				</div>
			)}
			{stats.mouseSpeed !== 0 && (
				<div>
					<span className="text-teal-400">Area Speed</span> +{' '}
					{Math.floor(
						Math.abs(stats.mouseSpeed / INITIAL_STATS.mouseSpeed) *
							100
					)}
					%
				</div>
			)}

			{(stats.upgradeHealth !== 0 ||
				stats.upgradeArmor !== 0 ||
				stats.upgradeBulletAttackDamage !== 0 ||
				stats.upgradeBulletAttackRange !== 0 ||
				stats.upgradeBulletAttackSpeed !== 0) && (
				<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
					Upgrade Stats
				</div>
			)}
			{stats.upgradeHealth !== 0 && (
				<div>
					<span className="text-green-600">Health</span> +{' '}
					{stats.upgradeHealth}
				</div>
			)}
			{stats.upgradeArmor !== 0 && (
				<div>
					<span className="text-cyan-400">Armor</span> +{' '}
					{stats.upgradeArmor}
				</div>
			)}
			{stats.upgradeBulletMaxAmmo !== 0 && (
				<div>
					<span className="text-green-400">Max Bullet Ammo</span> +{' '}
					{stats.upgradeBulletMaxAmmo}
				</div>
			)}
			{stats.upgradeBulletAmmoPrice !== 0 && (
				<div>
					<span className="text-teal-400">Upgrade Bullet Price</span>{' '}
					-
					{Math.floor(
						Math.abs(
							stats.upgradeBulletAmmoPrice /
								INITIAL_STATS.upgradeBulletAmmoPrice
						) * 100
					)}
					%
				</div>
			)}
			{stats.upgradeHealth !== 0 && (
				<div>
					<span className="text-green-600">Health</span> +{' '}
					{stats.upgradeHealth}
				</div>
			)}
			{stats.upgradeArmor !== 0 && (
				<div>
					<span className="text-cyan-400">Armor</span> +{' '}
					{stats.upgradeArmor}
				</div>
			)}
			{stats.upgradeBulletAttackDamage !== 0 && (
				<div>
					<span className="text-red-400">Upgrade Bullet Damage</span>{' '}
					+ {stats.upgradeBulletAttackDamage}
				</div>
			)}
			{stats.upgradeBulletAttackRange !== 0 && (
				<div>
					<span className="text-green-400">Upgrade Bullet Range</span>{' '}
					+ {stats.upgradeBulletAttackRange}
				</div>
			)}
			{stats.upgradeBulletAttackSpeed !== 0 && (
				<div>
					<span className="text-teal-400">Upgrade Bullet Speed</span>{' '}
					+{' '}
					{Math.floor(
						Math.abs(
							stats.upgradeBulletAttackSpeed /
								INITIAL_STATS.upgradeBulletAttackSpeed
						) * 100
					)}
					%
				</div>
			)}
		</div>
	)
}
