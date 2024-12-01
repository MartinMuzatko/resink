import { INITIAL_STATS } from '../data/initialGameData'
import { Connection } from '../domain/connection'
import {
	diffStats,
	getActiveStats,
	Stats,
	StatsEffectResult,
} from '../domain/stats'
import { Upgrade } from '../domain/upgrade'
import { StatsInfoPlain } from './StatsInfoPlain'

type StatsInfoProps = {
	stats: StatsEffectResult
	upgrade: Upgrade
	upgrades: Upgrade[]
	connections: Connection[]
}

export const StatsInfo = ({
	stats,
	upgrade,
	upgrades,
	connections,
}: StatsInfoProps) => {
	const diffedStats = diffStats(INITIAL_STATS, stats.globalStats)
	return <StatsInfoPlain stats={diffedStats} />
}
