import { useGameContext } from '../contexts/GameContext'
import { Bullet } from '../domain/bullet'

type BulletRenderProps = {
	bullet: Bullet
}

export const BulletRender = ({ bullet }: BulletRenderProps) => {
	const { gridScale } = useGameContext()
	return (
		<div
			className="absolute bg-amber-400 rounded-full z-40"
			key={bullet.id}
			style={{
				width: `${gridScale / 6}px`,
				height: `${gridScale / 6}px`,
				left: `${bullet.x * gridScale - gridScale / 6 / 2}px`,
				top: `${bullet.y * gridScale - gridScale / 6 / 2}px`,
			}}
		/>
	)
}
