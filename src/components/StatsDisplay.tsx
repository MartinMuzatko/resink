import { StatType, Stats, statDefinitions, StatKeys } from '../domain/stats'

type StatsDisplayProps = {
	displayStatType: StatType
	stats: Partial<Stats>
}

const defaultFormatter = (value: number) => `${value > 0 ? '+' : ''}${value}`

export const StatsDisplay = ({ stats, displayStatType }: StatsDisplayProps) => {
	const statsWithDefinition = Object.entries(stats).map(([key, value]) => ({
		...statDefinitions[key as StatKeys],
		key,
		value,
	}))
	return (
		<>
			{statsWithDefinition
				.filter((stat) =>
					displayStatType === StatType.global
						? true
						: stat.type === displayStatType
				)
				.map((stat) => (
					<div key={stat.key} className="flex items-center">
						<span className={`${stat.className} pr-1`}>
							{stat.name}
						</span>
						{'format' in stat
							? stat.format(stat.value)
							: defaultFormatter(stat.value)}
					</div>
				))}
		</>
	)
}
