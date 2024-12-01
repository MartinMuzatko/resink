import { useGameContext } from '../../contexts/GameContext'
import { Stats, StatsEffectResult } from '../../domain/stats'

type PowerMeterProps = {
	stats: StatsEffectResult
	power: number
}

export const PowerMeter = ({ stats, power }: PowerMeterProps) => {
	const { gridScale } = useGameContext()
	return (
		<div
			className="absolute border-2 bg-gray-800 border-red-900"
			style={{
				transform: 'translate(-50%, -50%)',
				width: 0.5 * gridScale,
				height: 1.5 * gridScale,
				top: `${3 * gridScale - gridScale / 2 + gridScale / 8}px`,
				left: `${-0.5 * gridScale - gridScale / 2 + gridScale / 8}px`,
			}}
		>
			<div className="font-bold font-mono absolute -rotate-90 origin-top-left top-10 -left-6">
				Power
			</div>

			<div
				className="absolute w-full bottom-0 bg-amber-300"
				style={{
					height: `${(power / stats.globalStats.maxPower) * 100}%`,
				}}
			></div>
			<div className="font-bold font-mono absolute -rotate-90 origin-top-left left-6 top-10">
				{power}/{stats.globalStats.maxPower}
			</div>
		</div>
	)
}
