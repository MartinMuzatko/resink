import { useGameContext } from '../contexts/GameContext'
import { Area } from '../domain/main'
import { Stats, StatsEffectResult } from '../domain/stats'
import { HealthBar } from './HealthBar'

type MouseAreaRenderProps = {
	mouseLastActivatedTime: number
	mouseArea: Area
	stats: StatsEffectResult
}

export const MouseAreaRender = ({
	mouseLastActivatedTime,
	mouseArea,
	stats,
}: MouseAreaRenderProps) => {
	const { gridScale, timePassed } = useGameContext()
	return (
		<div
			className={`absolute ${
				mouseLastActivatedTime > timePassed - 500
					? 'bg-orange-200/80'
					: 'bg-orange-400/50'
			}`}
			style={{
				top: `${mouseArea.y * gridScale}px`,
				left: `${mouseArea.x * gridScale}px`,
				width: `${mouseArea.width * gridScale}px`,
				height: `${mouseArea.height * gridScale}px`,
			}}
		>
			<HealthBar
				current={timePassed - mouseLastActivatedTime}
				max={stats.globalStats.mouseSpeed}
			/>
		</div>
	)
}
