import { INITIAL_STATS } from '../data/initialGameData'
import { Connection } from '../domain/connection'
import { diffStats, getActiveStats, Stats } from '../domain/stats'
import { Upgrade } from '../domain/upgrade'
import { StatsInfoPlain } from './StatsInfoPlain'

type StatsInfoProps = {
	stats: Stats
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
	const diffedStats = diffStats(INITIAL_STATS, stats)
	return <StatsInfoPlain stats={diffedStats} />
}
