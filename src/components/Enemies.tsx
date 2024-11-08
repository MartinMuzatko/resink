import { Dispatch, SetStateAction, useEffect, useMemo, useState } from 'react'
import { useGameContext } from '../contexts/GameContext'
import { generateRandomPositionOnEdge, lerp } from '../domain/main'
import { Upgrade, UpgradeType } from '../domain/upgrade'
import { Enemy, findTarget, getSpawnArea, moveEnemy } from '../domain/enemy'
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

const attackGrace = 10 * 1000
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

	const amountEnemies = Math.ceil(
		lerp(1, 5 * wave, timePassedSinceWaveStart / attackTime)
	)

	useEffect(() => {
		if (timePassedSinceWaveStart >= attackTime + attackGrace) {
			setWaveStartedTime(timePassed)
			setWave((wave) => wave + 1)
		}
		setEnemies((enemies) => {
			const activeUpgrades = upgrades.filter(
				(upgrade) =>
					upgrade.active && upgrade.type == UpgradeType.upgrade
			)
			// TODO: Scale amount and toughness of enemies with time.
			// Also create varients
			const newEnemies = [
				...enemies,
				...(activeUpgrades.length &&
				waveState == WaveState.ongoing &&
				enemies.length < amountEnemies
					? [
							...Array(
								Math.min(
									amountEnemies - enemies.length,
									amountEnemies
								)
							),
					  ].map(() => ({
							id: crypto.randomUUID(),
							...generateRandomPositionOnEdge(spawnArea),
							target: findTarget(upgrades).id,
							speed: 0.0025,
							health: 2,
					  }))
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
			<div className="absolute right-0 top-0">
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
			<div
				className="w-full h-full absolute top-0 left-0 pointer-events-none"
				style={{
					transform: 'translate(50%, 50%)',
				}}
			>
				{enemies.map((enemy) => (
					<div
						className="absolute bg-rose-600"
						key={enemy.id}
						style={{
							transform: 'translate(-50%, -50%)',
							width: `${gridScale / 4}px`,
							height: `${gridScale / 4}px`,
							left: `${enemy.x * gridScale + gridScale / 2}px`,
							top: `${enemy.y * gridScale + gridScale / 2}px`,
						}}
					>
						<HealthBar current={enemy.health} max={2} />
					</div>
				))}
			</div>
		</>
	)
}
