import { INITIAL_STATS } from '../data/initialGameData'
import { diffStats, Stats } from '../domain/stats'
import { Upgrade } from '../domain/upgrade'

type StatsInfoProps = {
	stats: Stats
	upgrade: Upgrade
	upgrades: Upgrade[]
}

export const StatsInfo = (props: StatsInfoProps) => {
	const changedStats = props.upgrade.effect(
		INITIAL_STATS,
		props.upgrade,
		props.upgrades
	)
	const diffedStats = diffStats(INITIAL_STATS, changedStats)
	return (
		<div>
			<pre>{JSON.stringify(diffedStats, null, 4)}</pre>
			<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
				Global Stats
			</div>
			{diffedStats.power != 0 && (
				<div>
					<span className="text-blue-600">Power</span> +{' '}
					{diffedStats.power}
				</div>
			)}
			<br />
			{diffedStats.globalHealth != 0 && (
				<div>
					<span className="text-green-600">Health</span> +{' '}
					{diffedStats.globalHealth}
				</div>
			)}
			{diffedStats.mouseDamage != 0 && (
				<div>
					<span className="text-red-600">Damage</span> +{' '}
					{diffedStats.mouseDamage}
				</div>
			)}
			{diffedStats.mouseSize != 0 && (
				<div>
					<span className="text-amber-600">Size</span> +{' '}
					{Math.floor(
						Math.abs(
							diffedStats.mouseSize / INITIAL_STATS.mouseSize
						) * 100
					)}
					%
				</div>
			)}
			{diffedStats.mouseAttackSpeed != 0 && (
				<div>
					<span className="text-teal-400">Attack Speed</span> +{' '}
					{Math.floor(
						Math.abs(
							diffedStats.mouseAttackSpeed /
								INITIAL_STATS.mouseAttackSpeed
						) * 100
					)}
					%
				</div>
			)}
			<br />
		</div>
	)
}
