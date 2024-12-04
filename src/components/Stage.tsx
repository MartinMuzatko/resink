import { memo, useEffect, useMemo, useState } from 'react'
import { type Connection } from '../domain/connection'
import {
	canUpgradeGeneratePower,
	canUpgradeShoot,
	damageUpgrade,
	generateExperienceOrbs,
	shootBullets,
	updateUpgradeDamage,
	Upgrade,
	UpgradeType,
} from '../domain/upgrade'
import { getActiveStats } from '../domain/stats'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'
import { useGameContext } from '../contexts/GameContext'
import {
	Area,
	doRectanglesIntersect,
	generateRandomPositionOnEdge,
	getDistance,
	getSpeedVector,
	isPositionInsideArea,
	lerp,
	Position,
} from '../domain/main'
import {
	createEnemy,
	Enemy,
	findTarget,
	getAreaFromEnemy,
	getSpawnArea,
	moveEnemy,
} from '../domain/enemy'
import { useMouse } from '@mantine/hooks'
import {
	DEBUG,
	INITIAL_CONNECTIONS,
	INITIAL_STATS,
	INITIAL_UPGRADES,
} from '../data/initialGameData'
import { StatsInfoPlain } from './StatsInfoPlain'
import {
	attractOrb,
	createExperienceOrb,
	ExperienceOrb,
	ExperienceOrbSource,
	spawnBasedOnEnemiesKilled,
} from '../domain/experienceOrb'
import { BulletMeter } from './meters/BulletMeter'
import { Bullet, createBullet, moveBullets } from '../domain/bullet'
import { PowerMeter } from './meters/PowerMeter'
import { EnemyRender } from './EnemyRender'
import { BulletRender } from './BulletRender'
import { ExperienceOrbRender } from './ExperienceOrbRender'
import { MouseAreaRender } from './MouseAreaRender'
import { ConnectionLineRender } from './ConnectionLineRender'

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
	const [power, setPower] = useState(DEBUG ? 1000 : 0)
	const connections: Connection[] = useMemo(() => INITIAL_CONNECTIONS, [])
	const stats = useMemo(
		() => getActiveStats(upgrades, connections, INITIAL_STATS),
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
		() => timePassed - (timePassed % stats.globalStats.mouseSpeed),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[tick]
	)

	useEffect(() => {
		// heal upgrades
		setUpgrades((upgrades) =>
			upgrades.map((upgrade) =>
				doRectanglesIntersect(
					{ ...upgrade, width: 0.5, height: 0.5 },
					mouseArea
				)
					? {
							...upgrade,
							health:
								upgrade.health +
								stats.globalStats.mouseHealAmount,
					  }
					: upgrade
			)
		)
		// attack enemies
		setEnemies((prevEnemies) => {
			const newEnemies = prevEnemies.map((enemy) =>
				doRectanglesIntersect(getAreaFromEnemy(enemy), mouseArea)
					? {
							...enemy,
							health:
								enemy.health -
								stats.globalStats.mouseAttackDamage,
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
		const size = stats.globalStats.mouseSize
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
			setPowerThroughEnemiesDefeated(0)
			setExperienceOrbs([])
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
				.map((upgrade) => damageUpgrade(upgrade, enemies, timePassed))
				.filter((u) => u.damage !== 0)

			const enemyIdsThatDealDamage = [
				...new Set(
					upgradesToTakeDamage.flatMap((u) =>
						u.enemiesThatDealDamage.map((e) => e.id)
					)
				),
			]
			const { upgrades: upgradesToShootBullets, bullets: newBullets } =
				shootBullets(prevUpgrades, stats, timePassed, ammo, enemies)
			setAmmo((ammo) => Math.max(0, ammo - newBullets.length))
			setBullets((bullets) => [
				...newBullets.slice(0, ammo - newBullets.length),
				...moveBullets(bullets),
			])

			const {
				upgrades: upgradesToGeneratePower,
				experienceOrbs: experienceOrbsGenerated,
			} = generateExperienceOrbs(
				upgradesToShootBullets,
				stats,
				timePassed,
				experienceOrbs
			)

			// hit enemies
			setEnemies((prevEnemies) => {
				const newEnemies = prevEnemies.map((enemy) => {
					const bulletsHit = bullets.filter((bullet) =>
						// TODO: true hitboxes maybe
						isPositionInsideArea(enemy, {
							x: bullet.x - 0.25,
							y: bullet.y - 0.25,
							height: 0.5,
							width: 0.5,
						})
					)
					const bulletsHitIds = bulletsHit.map((bullet) => bullet.id)
					setBullets((prevBullets) =>
						prevBullets.filter(
							(bullet) => !bulletsHitIds.includes(bullet.id)
						)
					)
					const bulletAttackDamage = bulletsHit.reduce(
						(acc, bullet) => acc + bullet.attackDamage,
						0
					)
					// TODO: real bounding box checking
					return bulletsHitIds.length
						? {
								...enemy,
								health: enemy.health - bulletAttackDamage,
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
					...experienceOrbsGenerated,
					...newEnemies
						.filter((enemy) => enemy.health <= 0)
						.map((enemy) =>
							createExperienceOrb({
								source: ExperienceOrbSource.enemy,
								x: enemy.x + 0.25,
								y: enemy.y + 0.25,
							})
						),
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
						upgradesToGeneratePower,
						connections,
						timePassed,
						stats
				  )
				: upgradesToGeneratePower
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
				...attractOrb(
					experienceOrb,
					gridMouse,
					deltaTime,
					stats.globalStats
				),
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
					stats.globalStats.maxPower,
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
					{/* <StatsInfoPlain stats={stats} /> */}
				</div>
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
				<MouseAreaRender
					{...{ mouseArea, mouseLastActivatedTime, stats }}
				/>
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
				<PowerMeter {...{ power, stats }} />
				<BulletMeter
					{...{
						ammo,
						setAmmo,
						power,
						setPower,
						stats,
					}}
				/>
				{enemies.map((enemy) => (
					<EnemyRender key={enemy.id} {...{ enemy }} />
				))}
				{bullets.map((bullet) => (
					<BulletRender key={bullet.id} {...{ bullet }} />
				))}
				{experienceOrbs.map((experienceOrb) => (
					<ExperienceOrbRender
						key={experienceOrb.id}
						{...{ experienceOrb }}
					/>
				))}
			</div>
		</div>
	)
})
