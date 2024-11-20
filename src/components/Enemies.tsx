import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { generateRandomPositionOnEdge, lerp } from '../domain/main'
import { Upgrade, UpgradeType } from '../domain/upgrade'
import {
	createEnemy,
	Enemy,
	findTarget,
	getSpawnArea,
	moveEnemy,
} from '../domain/enemy'
import { HealthBar } from './HealthBar'

type EnemiesProps = {
	upgrades: Upgrade[]
	enemies: Enemy[]
	setEnemies: Dispatch<SetStateAction<Enemy[]>>
}

enum WaveState {
	ongoing = 'ongoing',
	idle = 'idle',
}

const attackGrace = 15 * 1000
const attackTime = 25 * 1000
// const enemiesAmountScale = 1.5

export const Enemies = ({ enemies, setEnemies, upgrades }: EnemiesProps) => {
	const { gridScale, deltaTime, tick, timePassed } = useGameContext()
	const spawnArea = useMemo(() => getSpawnArea(upgrades), [upgrades])
	const [wave, setWave] = useState(1)
	const [waveStartedTime, setWaveStartedTime] = useState(0)

	const timePassedSinceWaveStart = timePassed - waveStartedTime
	const waveState = useMemo(() => {
		return timePassedSinceWaveStart <= attackTime
			? WaveState.ongoing
			: WaveState.idle
	}, [timePassedSinceWaveStart])

	const amountEnemies = Math.round(
		lerp(
			1,
			lerp(4, 30, Math.min(1, wave / 30)),
			timePassedSinceWaveStart / attackTime
		)
	)
	// const amountEnemies = 1

	useEffect(() => {
		if (timePassedSinceWaveStart >= attackTime + attackGrace) {
			setWaveStartedTime(timePassed)
			setWave((wave) => wave + 1)
		}
		setEnemies((enemies) => {
			// TODO: Scale amount and toughness of enemies with time.
			// Also create varients
			const newEnemies: Enemy[] = [
				...enemies,
				...(waveState == WaveState.ongoing &&
				enemies.length < amountEnemies
					? [
							...Array(
								Math.min(
									amountEnemies - enemies.length,
									amountEnemies
								)
							),
					  ].map(() =>
							createEnemy({
								id: crypto.randomUUID(),
								...generateRandomPositionOnEdge(spawnArea),
								target: findTarget(upgrades).id,
								attackSpeed: 2000,
								attackDamage: wave,
								movementSpeed: 0.0025,
								size: 0.25,
								health: Math.ceil(wave / 3),
								maxHealth: Math.ceil(wave / 3),
							})
					  )
					: []),
			]
			return newEnemies.map((enemy) =>
				moveEnemy(enemy, upgrades, deltaTime)
			)
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tick])

	return (
		<>
			<div
				className="absolute right-0 top-0 z-50"
				style={{
					// TODO: Maybe move wave etc to Stage or a context?
					transform: `translate(-${window.innerWidth / 2}px, -${
						window.innerHeight / 2
					}px)`,
				}}
			>
				<p>wave: {wave}</p>
				<p>waveState: {waveState}</p>
				<p>waveStarted: {(waveStartedTime / 1000).toFixed()}</p>
				<p>
					sinceWaveStart:{' '}
					{(timePassedSinceWaveStart / 1000).toFixed()}
				</p>
				<p>timePassed: {(timePassed / 1000).toFixed()}</p>
				<p>shouldSpawn: {amountEnemies}</p>
			</div>
			{enemies.map((enemy) => (
				<div
					className="absolute bg-rose-600 z-30"
					key={enemy.id}
					style={{
						width: `${enemy.size * gridScale}px`,
						height: `${enemy.size * gridScale}px`,
						left: `${enemy.x * gridScale}px`,
						top: `${enemy.y * gridScale}px`,
					}}
				>
					<HealthBar current={enemy.health} max={enemy.maxHealth} />
				</div>
			))}
		</>
	)
}
