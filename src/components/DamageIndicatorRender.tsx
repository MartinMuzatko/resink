import { useGameContext } from '../contexts/GameContext'
import {
	DamageIndicator,
	getDamageIndicatorElapsedTimeFactor,
} from '../domain/damageIndicator'
import { lerp, multiLerp } from '../domain/main'

type DamageIndicatorRenderProps = {
	damageIndicator: DamageIndicator
}

export const DamageIndicatorRender = ({
	damageIndicator,
}: DamageIndicatorRenderProps) => {
	const { gridScale, timePassed } = useGameContext()
	const timeFactor = getDamageIndicatorElapsedTimeFactor(
		damageIndicator,
		timePassed
	)
	return (
		<div
			className={`absolute z-50 text-center ${damageIndicator.className} font-bold`}
			style={{
				left: damageIndicator.current.x * gridScale,
				top: damageIndicator.current.y * gridScale,
				transform: `scale(${multiLerp([0.25, 1.5, 1, 0], timeFactor)})`,
				WebkitTextStroke: '1px white',
				paintOrder: 'stroke fill',
				opacity: lerp(1, 0, timeFactor),
			}}
		>
			{damageIndicator.value}
		</div>
	)
}
