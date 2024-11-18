import { useGameContext } from '../../contexts/GameContext'
import { Stats } from '../../domain/stats'

type PowerMeterProps = {
	stats: Stats
}

export const PowerMeter = ({ stats }: PowerMeterProps) => {
	const { gridScale } = useGameContext()
	return (
		<div
			className="absolute border-2 bg-gray-800 border-red-900"
			style={{
				width: 1 * gridScale - gridScale / 2,
				height: 2 * gridScale - gridScale / 2,
				top: `${2 * gridScale + gridScale / 4 - gridScale / 2}px`,
				left: `${-2 * gridScale + gridScale / 4 - gridScale / 2}px`,
			}}
		>
			<div className="font-bold font-mono absolute -rotate-90 origin-top-left top-10 -left-6">
				Power
			</div>

			<div
				className="absolute w-full bottom-0 bg-amber-300"
				style={{
					height: `${
						((stats.power - stats.usedPower) / stats.maxPower) * 100
					}%`,
				}}
			></div>
			<div className="font-bold font-mono absolute -rotate-90 origin-top-left left-6 top-10">
				{stats.power - stats.usedPower}/{stats.maxPower}
			</div>
		</div>
	)
}
