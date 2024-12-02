import { type Connection } from '../domain/connection'
import { isUpgradeAffordable, Upgrade } from '../domain/upgrade'
import { StatsEffectResult } from '../domain/stats'
import { ConnectionLineRender } from './ConnectionLineRender'

type ConnectionProps = {
	connection: Connection
	upgrades: Upgrade[]
	stats: StatsEffectResult
	power: number
}

export const ConnectionLine = ({
	upgrades,
	connection,
	stats,
	power,
}: ConnectionProps) => {
	const from = upgrades.find(
		(upgrade) => upgrade.id == connection.fromUpgradeId
	)
	const to = upgrades.find((upgrade) => upgrade.id == connection.toUpgradeId)
	if (!from || !to) return null

	const active = from.active && to.active
	const isAffordable = isUpgradeAffordable(
		to,
		upgrades,
		[connection],
		stats,
		power
	)
	return (
		<ConnectionLineRender
			{...{
				from,
				to,
				className: active
					? 'stroke-red-400'
					: isAffordable
					? 'stroke-red-200'
					: 'stroke-red-900',
			}}
		/>
	)
}
