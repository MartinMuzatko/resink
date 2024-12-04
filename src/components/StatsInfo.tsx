import { useMemo } from 'react'
import { INITIAL_STATS } from '../data/initialGameData'
import { Connection } from '../domain/connection'
import { getUpgradeDisplayStats, StatsEffectResult } from '../domain/stats'
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
	const upgradeDisplayStats = useMemo(
		() =>
			getUpgradeDisplayStats(
				upgrade,
				upgrades,
				connections,
				INITIAL_STATS,
				stats
			),
		[stats]
	)
	return <StatsInfoPlain {...{ upgrades, stats: upgradeDisplayStats }} />
}
