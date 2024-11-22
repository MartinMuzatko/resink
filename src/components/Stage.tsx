import { memo, useEffect, useMemo, useState } from 'react'
import { type Connection } from '../domain/connection'
import {
	canUpgradeShoot,
	updateUpgradeDamage,
	Upgrade,
	UpgradeType,
} from '../domain/upgrade'
import { getStatsFromActiveUpgrades } from '../domain/stats'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'
import { useGameContext } from '../contexts/GameContext'
import {
	Area,
	generateRandomPositionOnEdge,
	getDistance,
	getSpeedVector,
	isPositionInsideArea,
	lerp,
	Position,
} from '../domain/main'
import { Enemies } from './Enemies'
import {
	canEnemyDealDamage,
	createEnemy,
	Enemy,
	findTarget,
	getSpawnArea,
	moveEnemy,
} from '../domain/enemy'
import { useMouse } from '@mantine/hooks'
import { HealthBar } from './HealthBar'
import { INITIAL_CONNECTIONS, INITIAL_UPGRADES } from '../data/initialGameData'
import { StatsInfoPlain } from './StatsInfoPlain'
import {
	attractOrb,
	ExperienceOrb,
	spawnBasedOnEnemiesKilled,
} from '../domain/experienceOrb'
import { BulletMeter } from './meters/BulletMeter'
import { Bullet, createBullet } from '../domain/bullet'

// const enemyStats = {
// 	damage: 1,
// 	speed: 1000,
// }

const getGridPositionFromWindow = (
	position: Position,
	window: Window,
	gridScale: number
): Position => ({
	x: (position.x - window.document.body.clientWidth / 2) / gridScale,
	y: (position.y - window.document.body.clientHeight / 2) / gridScale,
})

type MouseArea = Area & {
	mouseLastActivatedTime: number
}

const attackGrace = 15 * 1000
const attackTime = 25 * 1000

enum WaveState {
	ongoing = 'ongoing',
	idle = 'idle',
}

export const Stage = memo(() => {
	const { tick, timePassed, gridScale, deltaTime } = useGameContext()
	const [totalEnemiesDefeated, setTotalEnemiesDefeated] = useState(0)
	const [experienceOrbs, setExperienceOrbs] = useState<ExperienceOrb[]>([])
	const [powerThroughEnemiesDefeated, setPowerThroughEnemiesDefeated] =
		useState(0)
	const [enemies, setEnemies] = useState<Enemy[]>([])
	const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES())
	const [ammo, setAmmo] = useState(10)
	const [power, setPower] = useState(0)
	const connections: Connection[] = useMemo(() => INITIAL_CONNECTIONS, [])
	const stats = useMemo(
		() => getStatsFromActiveUpgrades(upgrades),
		[upgrades]
	)
	const mouse = useMouse()
	const [bullets, setBullets] = useState<Bullet[]>([])

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
			lerp(2, 30, Math.min(1, wave / 30)),
			timePassedSinceWaveStart / attackTime
		)
	)

	const mouseLastActivatedTime = useMemo(
		() => timePassed - (timePassed % stats.mouseSpeed),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[tick]
	)

	useEffect(() => {
		// heal upgrades

		setUpgrades((upgrades) =>
			upgrades.map((upgrade) =>
				// TODO: real bounding box checking
				isPositionInsideArea(upgrade, mouseArea)
					? {
							...upgrade,
							health: upgrade.health + stats.mouseHealAmount,
					  }
					: upgrade
			)
		)
		// attack enemies
		setEnemies((prevEnemies) => {
			const newEnemies = prevEnemies.map((enemy) =>
				// TODO: real bounding box checking
				isPositionInsideArea(enemy, mouseArea)
					? {
							...enemy,
							health: enemy.health - stats.mouseAttackDamage,
					  }
					: enemy
			)
			const enemiesLeft = newEnemies.filter((enemy) => enemy.health > 0)
			setExperienceOrbs((experienceOrbs) => [
				...experienceOrbs,
				...spawnBasedOnEnemiesKilled(
					newEnemies.filter((enemy) => enemy.health <= 0),
					stats
				),
			])
			setTotalEnemiesDefeated(
				(totalEnemiesDefeated) =>
					totalEnemiesDefeated +
					prevEnemies.length -
					enemiesLeft.length
			)
			return enemiesLeft
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mouseLastActivatedTime])

	const mouseArea = useMemo((): MouseArea => {
		const center = getGridPositionFromWindow(mouse, window, gridScale)
		const size = stats.mouseSize
		return {
			x: center.x - size / 2,
			y: center.y - size / 2,
			width: size,
			height: size,
			mouseLastActivatedTime,
		}
	}, [mouse, mouseLastActivatedTime, gridScale, stats])
	const spawnArea = useMemo(() => getSpawnArea(upgrades), [upgrades])

	// Reset game when motor life is 0
	useEffect(() => {
		const motor = upgrades.find((u) => u.type === UpgradeType.motor)!
		if (motor.health <= 0) {
			setUpgrades(INITIAL_UPGRADES())
			setEnemies([])
			setTotalEnemiesDefeated(0)
			setExperienceOrbs([])
			setPowerThroughEnemiesDefeated(0)
			setWave(0)
			setWaveStartedTime(0)
		}
	}, [upgrades])

	useEffect(() => {
		if (timePassedSinceWaveStart >= attackTime + attackGrace) {
			setWaveStartedTime(timePassed)
			setWave((wave) => wave + 1)
		}
		// update upgrade health on enemy attack
		setUpgrades((prevUpgrades) => {
			const upgradesToTakeDamage = prevUpgrades
				.map((upgrade) => {
					const enemiesThatDealDamage = enemies.filter((enemy) =>
						canEnemyDealDamage(enemy, upgrade, timePassed)
					)
					return {
						upgrade,
						enemiesThatDealDamage,
						damage: enemiesThatDealDamage.reduce(
							(acc, cur) => acc + cur.attackDamage,
							0
						),
					}
				})
				.filter((u) => u.damage !== 0)

			const enemyIdsThatDealDamage = [
				...new Set(
					upgradesToTakeDamage.flatMap((u) =>
						u.enemiesThatDealDamage.map((e) => e.id)
					)
				),
			]
			const { upgrades: newUpgrades, bullets: newBullets } =
				prevUpgrades.reduce<{
					upgrades: Upgrade[]
					bullets: Bullet[]
				}>(
					({ upgrades, bullets }, upgrade) => {
						if (!canUpgradeShoot(upgrade, stats, timePassed, ammo))
							return { upgrades: [...upgrades, upgrade], bullets }

						const enemiesInRange = enemies.filter(
							(enemy) =>
								getDistance(upgrade, enemy) <
								stats.upgradeBulletAttackRange
						)

						if (enemiesInRange.length === 0)
							return { upgrades: [...upgrades, upgrade], bullets }

						const targetEnemy = enemiesInRange.reduce(
							(closest, enemy) =>
								getDistance(upgrade, enemy) <
								getDistance(upgrade, closest)
									? enemy
									: closest
						)

						const updatedUpgrade = {
							...upgrade,
							lastBulletShotTime: timePassed,
						}
						// TODO: React.StrictMode makes this get added twice per tick in dev mode
						// we could add a tickFired prop and compare then.
						const newBullet = createBullet({
							x: upgrade.x,
							y: upgrade.y,
							velocity: getSpeedVector(
								{ x: upgrade.x, y: upgrade.y },
								targetEnemy,
								0.1
							),
						})

						return {
							upgrades: [...upgrades, updatedUpgrade],
							bullets: [...bullets, newBullet],
						}
					},
					{ upgrades: [], bullets: [] } // Initial value with the specified type
				)
			setAmmo((ammo) => Math.max(0, ammo - newBullets.length))
			setBullets((bullets) => [
				...newBullets.slice(0, ammo - newBullets.length),
				...bullets
					.map((bullet) => ({
						...bullet,
						x: bullet.x + bullet.velocity.x,
						y: bullet.y + bullet.velocity.y,
					}))
					.filter((bullet) =>
						isPositionInsideArea(bullet, {
							x: -10,
							y: -10,
							width: 20,
							height: 20,
						})
					),
			])
			// hit enemies
			setEnemies((prevEnemies) => {
				const newEnemies = prevEnemies.map((enemy) => {
					const bulletsHitIds = bullets
						.filter((bullet) =>
							isPositionInsideArea(enemy, {
								x: bullet.x - 0.25,
								y: bullet.y - 0.25,
								height: 0.5,
								width: 0.5,
							})
						)
						.map((bullet) => bullet.id)
					setBullets((prevBullets) =>
						prevBullets.filter(
							(bullet) => !bulletsHitIds.includes(bullet.id)
						)
					)
					// TODO: real bounding box checking
					return bulletsHitIds.length
						? {
								...enemy,
								health:
									enemy.health -
									stats.upgradeBulletAttackDamage,
						  }
						: enemy
				})
				const enemiesLeft = newEnemies.filter(
					(enemy) => enemy.health > 0
				)
				const enemiesAttackedUpgrades = enemiesLeft.map((enemy) => ({
					...enemy,
					lastAttackDealtTime: enemyIdsThatDealDamage.includes(
						enemy.id
					)
						? timePassed
						: enemy.lastAttackDealtTime,
				}))
				setExperienceOrbs((experienceOrbs) => [
					...experienceOrbs,
					...newEnemies
						.filter((enemy) => enemy.health <= 0)
						.map((enemy) => ({
							id: crypto.randomUUID(),
							amount: 1,
							x: enemy.x + 0.25,
							y: enemy.y + 0.25,
						})),
				])
				setTotalEnemiesDefeated(
					(totalEnemiesDefeated) =>
						totalEnemiesDefeated +
						prevEnemies.length -
						enemiesLeft.length
				)

				const addedEnemies: Enemy[] = [
					...enemiesAttackedUpgrades,
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
									health: 1 + Math.ceil(wave / 3),
									maxHealth: 1 + Math.ceil(wave / 3),
								})
						  )
						: []),
				]
				return addedEnemies.map((enemy) =>
					moveEnemy(enemy, upgrades, deltaTime)
				)
			})

			return upgradesToTakeDamage.length
				? updateUpgradeDamage(
						upgradesToTakeDamage,
						newUpgrades,
						connections,
						timePassed,
						stats
				  )
				: newUpgrades
		})

		setExperienceOrbs((experienceOrbs) => {
			// Move orb
			const gridMouse = getGridPositionFromWindow(
				mouse,
				window,
				gridScale
			)
			const newExperienceOrbs = experienceOrbs.map((experienceOrb) => ({
				...experienceOrb,
				...attractOrb(experienceOrb, gridMouse, deltaTime),
			}))
			const experienceOrbsConsumed = newExperienceOrbs.filter(
				(experienceOrb) =>
					isPositionInsideArea(experienceOrb, {
						x: gridMouse.x - 0.15,
						y: gridMouse.y - 0.15,
						width: 0.3,
						height: 0.3,
					})
			)
			setPower((prevPower) =>
				Math.min(
					stats.maxPower,
					prevPower + experienceOrbsConsumed.length
				)
			)
			const ids = experienceOrbsConsumed.map(
				(experienceOrb) => experienceOrb.id
			)
			return newExperienceOrbs.filter(
				(experienceOrb) => !ids.includes(experienceOrb.id)
			)
		})

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tick])

	return (
		<div className="w-full h-full top-0 left-0 absolute" ref={mouse.ref}>
			<div className="absolute right-0 top-0 z-50">
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
			<div className="absolute left-0 top-0">
				<div className="border">
					<StatsInfoPlain stats={stats} />
				</div>
				{/* {mouse.x - window.innerWidth / 2 - gridScale / 2},
				{mouse.y - window.innerHeight / 2 - gridScale / 2}
				<br />
				{gridMouse.x.toFixed(0)},{gridMouse.y.toFixed(0)}
				<br /> */}
			</div>
			<div className="absolute right-0 bottom-12">
				attacktime: {(timePassed / 1000).toFixed(0)}
				<br />
				last attack: {mouseLastActivatedTime / 1000}
			</div>
			<div
				className="w-full h-full absolute left-0 top-0"
				style={{
					transform: 'translate(50%, 50%)',
				}}
			>
				{/* Mouse Area */}
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
						max={stats.mouseSpeed}
					/>
				</div>
				{connections.map((connection) => (
					<ConnectionLine
						key={connection.id}
						{...{ connection, upgrades, stats, power }}
					/>
				))}
				{upgrades.map((upgrade) => (
					<UpgradeNode
						key={upgrade.id}
						{...{
							upgrade,
							upgrades,
							setUpgrades,
							stats,
							connections,
							power,
							setPower,
						}}
					/>
				))}
				{/* Power Meter */}
				<div
					className="absolute border-2 bg-gray-800 border-red-900"
					style={{
						transform: 'translate(-50%, -50%)',
						width: 0.5 * gridScale,
						height: 1.5 * gridScale,
						top: `${
							3 * gridScale - gridScale / 2 + gridScale / 8
						}px`,
						left: `${
							-0.5 * gridScale - gridScale / 2 + gridScale / 8
						}px`,
					}}
				>
					<div className="font-bold font-mono absolute -rotate-90 origin-top-left top-10 -left-6">
						Power
					</div>

					<div
						className="absolute w-full bottom-0 bg-amber-300"
						style={{
							height: `${(power / stats.maxPower) * 100}%`,
						}}
					></div>
					<div className="font-bold font-mono absolute -rotate-90 origin-top-left left-6 top-10">
						{power}/{stats.maxPower}
					</div>
				</div>
				<BulletMeter
					{...{
						ammo,
						setAmmo,
						power,
						setPower,
						stats,
					}}
				/>
				<Enemies
					{...{
						wave,
						setWave,
						waveStartedTime,
						setWaveStartedTime,
						bullets,
						upgrades,
						enemies,
						setEnemies,
					}}
				/>
				{bullets.map((bullet) => (
					<div
						className="absolute bg-amber-400 rounded-full z-40"
						key={bullet.id}
						style={{
							width: `${gridScale / 6}px`,
							height: `${gridScale / 6}px`,
							left: `${
								bullet.x * gridScale - gridScale / 6 / 2
							}px`,
							top: `${
								bullet.y * gridScale - gridScale / 6 / 2
							}px`,
						}}
					/>
				))}
				{experienceOrbs.map((experienceOrb) => (
					<div
						className="absolute bg-blue-600 rounded-full z-40"
						key={experienceOrb.id}
						style={{
							width: `${gridScale / 6}px`,
							height: `${gridScale / 6}px`,
							left: `${
								experienceOrb.x * gridScale - gridScale / 6 / 2
							}px`,
							top: `${
								experienceOrb.y * gridScale - gridScale / 6 / 2
							}px`,
						}}
					/>
				))}
			</div>
		</div>
	)
})
