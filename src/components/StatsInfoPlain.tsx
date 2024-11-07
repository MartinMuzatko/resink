import { INITIAL_STATS } from '../data/initialGameData'
import { Stats } from '../domain/stats'

type StatsInfoProps = {
	stats: Stats
}
// TODO: decide whether to show relative or absolute stats
export const StatsInfoPlain = ({ stats }: StatsInfoProps) => {
	return (
		<div>
			{(stats.power !== 0 ||
				stats.globalHealth !== 0 ||
				stats.globalArmor !== 0 ||
				stats.mouseAttackDamage !== 0 ||
				stats.mouseSize !== 0 ||
				stats.mouseHealAmount !== 0 ||
				stats.upgradeBulletAttackDamage !== 0 ||
				stats.mouseSpeed !== 0) && (
				<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
					Global Stats
				</div>
			)}
			{stats.power !== 0 && (
				<div>
					<span className="text-blue-600">Power</span> + {stats.power}
				</div>
			)}
			{stats.maxPower !== 0 && (
				<div>
					<span className="text-blue-800">Max Power</span> +{' '}
					{stats.maxPower}
				</div>
			)}
			{stats.globalHealth !== 0 && (
				<div>
					<span className="text-green-600">Health</span> +{' '}
					{stats.globalHealth}
				</div>
			)}
			{stats.globalArmor !== 0 && (
				<div>
					<span className="text-cyan-400">Armor</span> +{' '}
					{stats.globalArmor}
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
			{(stats.upgradeHealth !== 0 || stats.upgradeArmor !== 0) && (
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
					{stats.globalArmor}
				</div>
			)}
		</div>
	)
}
