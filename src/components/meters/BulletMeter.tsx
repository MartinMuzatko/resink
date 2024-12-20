import { Dispatch, SetStateAction } from 'react'
import { Stats, StatsEffectResult } from '../../domain/stats'
import { Tooltip } from '@mantine/core'
import { BsLightningChargeFill } from 'react-icons/bs'
import { GiHeavyBullets } from 'react-icons/gi'
import { useGameContext } from '../../contexts/GameContext'
import { clamp } from '../../domain/main'

type BulletMeterProps = {
	stats: StatsEffectResult
	ammo: number
	setAmmo: Dispatch<SetStateAction<number>>
	power: number
	setPower: Dispatch<SetStateAction<number>>
}

export const BulletMeter = ({
	ammo,
	setAmmo,
	stats,
	power,
	setPower,
}: BulletMeterProps) => {
	const toSpend = Math.ceil(
		clamp(
			0,
			(stats.globalStats.bulletMaxAmmo - ammo) *
				stats.globalStats.bulletAmmoPrice
		)(power * stats.globalStats.bulletAmmoPrice)
	)
	const ammoBought = Math.min(
		toSpend * (1 / stats.globalStats.bulletAmmoPrice),
		stats.globalStats.bulletMaxAmmo - ammo
	)

	const { gridScale } = useGameContext()
	return (
		<Tooltip
			label={
				<div className="flex items-center">
					Refill {ammoBought} <GiHeavyBullets className="mx-1" /> for{' '}
					{toSpend}
					<BsLightningChargeFill className="ml-1" />
				</div>
			}
			position="right-end"
		>
			<div
				onClick={() => {
					setAmmo((ammo) =>
						clamp(
							0,
							stats.globalStats.bulletMaxAmmo
						)(ammo + ammoBought)
					)
					setPower((prevPower) => prevPower - toSpend)
				}}
				className="absolute z-30 border-2 cursor-pointer bg-gray-800 border-red-900"
				style={{
					transform: 'translate(-50%, -50%)',
					width: 1 * gridScale - gridScale / 2,
					height: 2 * gridScale - gridScale / 2,
					top: `${-1 * gridScale - gridScale / 2 + gridScale / 8}px`,
					left: `${
						3.5 * gridScale - gridScale / 2 + gridScale / 8
					}px`,
				}}
			>
				<div className="font-bold font-mono absolute -rotate-90 origin-top-left top-24 -left-6">
					Bullet&nbsp;Ammo
				</div>

				<div
					className="absolute w-full bottom-0 bg-amber-600 transition-all"
					style={{
						height: `${
							(ammo / stats.globalStats.bulletMaxAmmo) * 100
						}%`,
					}}
				></div>
				<div className="font-bold font-mono absolute -rotate-90 origin-top-left left-6 top-10">
					{ammo}/{stats.globalStats.bulletMaxAmmo}
				</div>
			</div>
		</Tooltip>
	)
}
