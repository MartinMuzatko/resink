import { statDefinitions, StatKeys, Stats } from '../domain/stats'

type StatsInfoProps = {
	stats: Partial<Stats>
}
// TODO: decide whether to show relative or absolute stats
export const StatsInfoPlain = ({ stats }: StatsInfoProps) => {
	const filteredStats = Object.entries(stats)
		.map(([key, value]) => ({
			...statDefinitions[key as StatKeys],
			value,
			key,
		}))
		.filter((stat) => stat.value !== 0)

	return (
		<div>
			<pre>{JSON.stringify(stats, null, 4)}</pre>
			{filteredStats.map((stat) => (
				<div key={stat.key}>
					<span className={stat.className}>{stat.name}</span>
					{stat.value > 0 && '+'}
					{stat.value}
				</div>
			))}
			<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
				Global Stats
			</div>
			<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
				Upgrade Stats
			</div>
			{/* TODO: current stats display and changes in two diff. components.
			Also: automated display based on json, e.g. { displayType: percentage, color, } */}
		</div>
	)
}
