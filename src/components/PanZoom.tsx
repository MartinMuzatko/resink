import { ReactNode, useState } from 'react'

type PanZoomProps = { children: ReactNode }
export const PanZoom = (props: PanZoomProps) => {
	const [isTranslating, setIsTranslating] = useState(false)
	const [translate, setTranslate] = useState([0, 0])
	return (
		<div
			style={{
				transform: `translate(${translate[0]}px, ${translate[1]}px)`,
			}}
			className="w-full h-full border border-red-400/10"
			onMouseDown={() => {
				setIsTranslating(true)
			}}
			onMouseUp={() => {
				setIsTranslating(false)
			}}
			onMouseMove={(event) => {
				if (!isTranslating) return
				setTranslate((translate) => [
					translate[0] + event.movementX,
					translate[1] + event.movementY,
				])
			}}
		>
			{props.children}
		</div>
	)
}
