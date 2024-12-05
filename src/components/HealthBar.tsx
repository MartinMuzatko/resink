import { useGameContext } from '../contexts/GameContext'

type HealthBarProps = {
	current: number
	max: number
	className?: string
}

export const HealthBar = ({ current, max, className }: HealthBarProps) => {
	const { gridScale } = useGameContext()
	return (
		<div
			className={`absolute top-full w-full bg-green-800 z-20 ${className}`}
			style={{
				height: gridScale / 16,
			}}
		>
			<div
				className="absolute top-0 bg-green-400 z-20"
				style={{
					height: gridScale / 16,
					width: `${(current / max) * 100}%`,
				}}
			></div>
		</div>
	)
}
