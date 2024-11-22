import { useGameContext } from '../contexts/GameContext'
import { ExperienceOrb } from '../domain/experienceOrb'

type ExperienceOrbRenderProps = {
	experienceOrb: ExperienceOrb
}

export const ExperienceOrbRender = ({
	experienceOrb,
}: ExperienceOrbRenderProps) => {
	const { gridScale } = useGameContext()
	return (
		<div
			className="absolute bg-blue-600 rounded-full z-40"
			style={{
				width: `${gridScale / 6}px`,
				height: `${gridScale / 6}px`,
				left: `${experienceOrb.x * gridScale - gridScale / 6 / 2}px`,
				top: `${experienceOrb.y * gridScale - gridScale / 6 / 2}px`,
			}}
		/>
	)
}
