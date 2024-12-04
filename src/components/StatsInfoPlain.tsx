import { useGameContext } from '../contexts/GameContext'
import {
	removeEmtpyStatKeys,
	StatsEffectResult,
	StatType,
} from '../domain/stats'
import { Upgrade } from '../domain/upgrade'
import { StatsDisplay } from './StatsDisplay'

type StatsInfoProps = {
	upgrades: Upgrade[]
	stats: StatsEffectResult
}

// TODO: decide whether to show relative or absolute stats
export const StatsInfoPlain = ({ stats, upgrades }: StatsInfoProps) => {
	const globalStats = removeEmtpyStatKeys(stats.globalStats)
	const { gridScale } = useGameContext()
	return (
		<div>
			{Object.keys(globalStats).length > 0 && (
				<>
					<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
						Global Stats
					</div>
					<StatsDisplay
						stats={globalStats}
						displayStatType={StatType.global}
					/>
				</>
			)}
			<div className="text-xs pt-1 uppercase font-bold leading-relaxed">
				Upgrade Stats
			</div>
			{[...stats.upgradeStats.entries()].map(([upgradeId, stats]) => (
				<div key={upgradeId}>
					<div
						className="bg-red-400 border-red-400 p-1"
						style={{
							width: gridScale / 2,
						}}
					>
						{upgrades.find((u) => u.id === upgradeId)?.icon}
					</div>
					<StatsDisplay
						stats={removeEmtpyStatKeys(stats)}
						displayStatType={StatType.scoped}
					/>
				</div>
			))}
			{/* TODO: current stats display and changes in two diff. components.
			Also: automated display based on json, e.g. { displayType: percentage, color, } */}
		</div>
	)
}
