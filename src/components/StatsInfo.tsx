import { INITIAL_STATS } from '../data/initialGameData'
import { diffStats, Stats } from '../domain/stats'
import { Upgrade } from '../domain/upgrade'
import { StatsInfoPlain } from './StatsInfoPlain'

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
	return <StatsInfoPlain stats={diffedStats} />
}
