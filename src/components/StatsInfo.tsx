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
			{/* <pre>{JSON.stringify(diffedStats, null, 4)}</pre> */}
			{(diffedStats.power !== 0 ||
				diffedStats.globalHealth !== 0 ||
				diffedStats.globalArmor !== 0 ||
				diffedStats.mouseDamage !== 0 ||
				diffedStats.mouseSize !== 0 ||
				diffedStats.mouseAttackSpeed !== 0) && (
				<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
					Global Stats
				</div>
			)}
			{diffedStats.power !== 0 && (
				<div>
					<span className="text-blue-600">Power</span> +{' '}
					{diffedStats.power}
				</div>
			)}
			{diffedStats.globalHealth !== 0 && (
				<div>
					<span className="text-green-600">Health</span> +{' '}
					{diffedStats.globalHealth}
				</div>
			)}
			{diffedStats.globalArmor !== 0 && (
				<div>
					<span className="text-cyan-400">Armor</span> +{' '}
					{diffedStats.globalArmor}
				</div>
			)}
			{diffedStats.mouseDamage !== 0 && (
				<div>
					<span className="text-red-600">Damage</span> +{' '}
					{diffedStats.mouseDamage}
				</div>
			)}
			{diffedStats.mouseSize !== 0 && (
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
			{diffedStats.mouseAttackSpeed !== 0 && (
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
			{(diffedStats.upgradeHealth !== 0 ||
				diffedStats.upgradeArmor !== 0) && (
				<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
					Upgrade Stats
				</div>
			)}
			{diffedStats.upgradeHealth !== 0 && (
				<div>
					<span className="text-green-600">Health</span> +{' '}
					{diffedStats.upgradeHealth}
				</div>
			)}
			{diffedStats.upgradeArmor !== 0 && (
				<div>
					<span className="text-cyan-400">Armor</span> +{' '}
					{diffedStats.globalArmor}
				</div>
			)}
		</div>
	)
}
