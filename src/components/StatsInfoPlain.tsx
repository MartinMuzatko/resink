import { INITIAL_STATS } from '../data/initialGameData'
import { Stats } from '../domain/stats'

type StatsInfoProps = {
	stats: Stats
}

export const StatsInfoPlain = ({ stats }: StatsInfoProps) => {
	return (
		<div>
			{(stats.power !== 0 ||
				stats.globalHealth !== 0 ||
				stats.globalArmor !== 0 ||
				stats.mouseDamage !== 0 ||
				stats.mouseSize !== 0 ||
				stats.mouseAttackSpeed !== 0) && (
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
			{stats.mouseDamage !== 0 && (
				<div>
					<span className="text-red-600">Damage</span> +{' '}
					{stats.mouseDamage}
				</div>
			)}
			{stats.mouseSize !== 0 && (
				<div>
					<span className="text-amber-600">Size</span> +{' '}
					{Math.floor(
						Math.abs(stats.mouseSize / INITIAL_STATS.mouseSize) *
							100
					)}
					%
				</div>
			)}
			{stats.mouseAttackSpeed !== 0 && (
				<div>
					<span className="text-teal-400">Attack Speed</span> +{' '}
					{Math.floor(
						Math.abs(
							stats.mouseAttackSpeed /
								INITIAL_STATS.mouseAttackSpeed
						) * 100
					)}
					%
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
