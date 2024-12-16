import { memo, useEffect, useMemo, useState } from 'react'
import { type Connection } from '../domain/connection'
import {
	damageUpgrade,
	deactivateSubTree,
	deactivateSubTrees,
	generateExperienceOrbs,
	shootBullets,
	updateUpgradeDamage,
	Upgrade,
	UpgradeType,
} from '../domain/upgrade'
import { getActiveStats, getCost } from '../domain/stats'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'
import { useGameContext } from '../contexts/GameContext'
import {
	Area,
	doRectanglesIntersect,
	isPositionInsideArea,
	lerp,
	multiLerp,
	Position,
} from '../domain/main'
import {
	Enemy,
	getAreaFromEnemy,
	getSpawnArea,
	moveEnemy,
	spawnEnemies,
	WaveState,
} from '../domain/enemy'
import { useMouse } from '@mantine/hooks'
import {
	DEBUG,
	INITIAL_CONNECTIONS,
	INITIAL_STATS,
	INITIAL_UPGRADES,
} from '../data/initialGameData'
import {
	attractOrb,
	createExperienceOrb,
	ExperienceOrb,
	ExperienceOrbSource,
	createExperienceOrbsOnEnemiesKilled,
} from '../domain/experienceOrb'
import { BulletMeter } from './meters/BulletMeter'
import { Bullet, moveBullets } from '../domain/bullet'
import { PowerMeter } from './meters/PowerMeter'
import { EnemyRender } from './EnemyRender'
import { BulletRender } from './BulletRender'
import { ExperienceOrbRender } from './ExperienceOrbRender'
import { MouseAreaRender } from './MouseAreaRender'
import {
	createDamageIndicator,
	DamageIndicator,
	getDamageIndicatorElapsedTimeFactor,
	MAX_DAMAGE_INDICATOR_DURATION,
	moveDamageIndicator,
} from '../domain/damageIndicator'
import { DamageIndicatorRender } from './DamageIndicatorRender'

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

export const Stage = memo(() => {
	const { tick, timePassed, gridScale, deltaTime } = useGameContext()
	// world state
	const [totalEnemiesDefeated, setTotalEnemiesDefeated] = useState(0)
	// world objects
	const [experienceOrbs, setExperienceOrbs] = useState<ExperienceOrb[]>([])
	const [enemies, setEnemies] = useState<Enemy[]>([])
	const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES())
	const [bullets, setBullets] = useState<Bullet[]>([])
	const [damageIndicators, setDamageIndicators] = useState<DamageIndicator[]>(
		[]
	)
	const connections: Connection[] = useMemo(() => INITIAL_CONNECTIONS, [])
	// meters
	const [ammo, setAmmo] = useState(0)
	const [power, setPower] = useState(DEBUG ? 1000 : 0)
	// computed
	const stats = useMemo(
		() => getActiveStats(upgrades, connections, INITIAL_STATS),
		[upgrades]
	)
	const mouse = useMouse()

	// enemy state
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
		setUpgrades((upgrades) => {
			const {
				upgrades: newUpgrades,
				damageIndicators: damageIndicatorsOnMouseHeal,
			} = upgrades.reduce(
				(acc, upgrade) => {
					const toHeal =
						stats.upgradeStats.get(upgrade.id)!.upgradeHealth -
						upgrade.health
					const hit =
						doRectanglesIntersect(
							{ ...upgrade, width: 0.5, height: 0.5 },
							mouseArea
						) &&
						stats.globalStats.mouseHealAmount > 0 &&
						upgrade.active &&
						toHeal > 0
					return {
						upgrades: [
							...acc.upgrades,
							hit
								? {
										...upgrade,
										health:
											upgrade.health +
											stats.globalStats.mouseHealAmount,
								  }
								: upgrade,
						],
						damageIndicators: [
							...acc.damageIndicators,
							...(hit
								? [
										createDamageIndicator({
											createdTime: timePassed,
											value: stats.globalStats
												.mouseHealAmount,
											origin: {
												x: upgrade.x,
												y: upgrade.y,
											},
											current: {
												x: upgrade.x,
												y: upgrade.y,
											},
											className: 'text-green-600',
										}),
								  ]
								: []),
						],
					}
				},
				{
					upgrades: [],
					damageIndicators: [],
				} as {
					upgrades: Upgrade[]
					damageIndicators: DamageIndicator[]
				}
			)
			setDamageIndicators((damageIndicators) => [
				...damageIndicators,
				...damageIndicatorsOnMouseHeal,
			])
			return newUpgrades
		})
		// attack enemies
		setEnemies((prevEnemies) => {
			const {
				enemies: newEnemies,
				damageIndicators: damageIndicatorsOnMouseHit,
			} = prevEnemies.reduce(
				(acc, enemy) => {
					const hit = doRectanglesIntersect(
						getAreaFromEnemy(enemy),
						mouseArea
					)
					return {
						enemies: [
							...acc.enemies,
							hit
								? {
										...enemy,
										health:
											enemy.health -
											stats.globalStats.mouseAttackDamage,
								  }
								: enemy,
						],
						damageIndicators: [
							...acc.damageIndicators,
							...(hit
								? [
										createDamageIndicator({
											createdTime: timePassed,
											value: stats.globalStats
												.mouseAttackDamage,
											origin: {
												x: enemy.x,
												y: enemy.y,
											},
											current: {
												x: enemy.x,
												y: enemy.y,
											},
											className: 'text-amber-600',
										}),
								  ]
								: []),
						],
					}
				},
				{
					enemies: [],
					damageIndicators: [],
				} as {
					enemies: Enemy[]
					damageIndicators: DamageIndicator[]
				}
			)
			setDamageIndicators((damageIndicators) => [
				...damageIndicators,
				...damageIndicatorsOnMouseHit,
			])
			const enemiesLeft = newEnemies.filter((enemy) => enemy.health > 0)
			setExperienceOrbs((experienceOrbs) => [
				...experienceOrbs,
				...createExperienceOrbsOnEnemiesKilled(
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

	// TODO: Performance, display mouse but only update state based on tick
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

	// Reset on game over when motor life is 0
	useEffect(() => {
		const motor = upgrades.find((u) => u.type === UpgradeType.motor)!
		if (motor.health <= 0) {
			setUpgrades(INITIAL_UPGRADES())
			setEnemies([])
			setTotalEnemiesDefeated(0)
			setExperienceOrbs([])
			setWave(0)
			setWaveStartedTime(0)
		}
	}, [upgrades])

	// tick based effects
	useEffect(() => {
		if (timePassedSinceWaveStart >= attackTime + attackGrace) {
			setWaveStartedTime(timePassed)
			setWave((wave) => wave + 1)
		}

		// clean up indicators
		setDamageIndicators((damageIndicators) =>
			damageIndicators
				.filter(
					(d) =>
						timePassed <
						d.createdTime + MAX_DAMAGE_INDICATOR_DURATION
				)
				.map((damageIndicator) =>
					moveDamageIndicator(damageIndicator, timePassed)
				)
		)
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

			// hit and spawn enemies
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
					setDamageIndicators((damageIndicators) => [
						...damageIndicators,
						...bulletsHit.map((bullet) =>
							createDamageIndicator({
								createdTime: timePassed,
								value: bullet.attackDamage,
								origin: {
									x: bullet.x,
									y: bullet.y,
								},
								current: {
									x: bullet.x,
									y: bullet.y,
								},
								className: 'text-amber-600',
							})
						),
					])
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
					...spawnEnemies(
						enemies,
						upgrades,
						amountEnemies,
						waveState,
						wave,
						spawnArea
					),
				]
				return addedEnemies.map((enemy) =>
					moveEnemy(enemy, upgrades, deltaTime, timePassed)
				)
			})

			const damagedUpgrades = upgradesToTakeDamage.length
				? updateUpgradeDamage(
						upgradesToTakeDamage,
						upgradesToGeneratePower,
						connections,
						timePassed,
						stats
				  )
				: upgradesToGeneratePower

			const deactivatedUpgrades = deactivateSubTrees(
				damagedUpgrades,
				connections
			)

			const onlyDeactivatedUpgrades = deactivatedUpgrades.filter(
				(du) =>
					!du.active &&
					damagedUpgrades.find((u) => u.id == du.id)?.active
			)

			const remainderExperienceOrbs = onlyDeactivatedUpgrades.flatMap(
				(upgrade) => {
					const cost = getCost(stats, upgrade)
					// TODO: turn into stat
					const penaltyRemainder = Math.floor(cost / 3)
					return [...Array(penaltyRemainder)].map(() =>
						createExperienceOrb({
							x: upgrade.x + Math.random() / 2,
							y: upgrade.y + Math.random() / 2,
							amount: 1,
						})
					)
				}
			)

			setExperienceOrbs((experienceOrbs) => [
				...experienceOrbs,
				...remainderExperienceOrbs,
			])

			return deactivatedUpgrades
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
			const experienceAmount = experienceOrbsConsumed.reduce(
				(acc, cur) => acc + cur.amount,
				0
			)
			setPower((prevPower) =>
				Math.min(
					stats.globalStats.maxPower,
					prevPower + experienceAmount
				)
			)
			setDamageIndicators((damageIndicators) => [
				...damageIndicators,
				...[...Array(experienceAmount)].map(() =>
					createDamageIndicator({
						createdTime: timePassed,
						className: 'text-blue-400',
						value: experienceAmount,
						origin: {
							x: experienceOrbsConsumed[0].x,
							y: experienceOrbsConsumed[0].y,
						},
						current: {
							x: experienceOrbsConsumed[0].x,
							y: experienceOrbsConsumed[0].y,
						},
					})
				),
			])
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
				{damageIndicators.map((damageIndicator) => (
					<DamageIndicatorRender
						key={damageIndicator.id}
						{...{ damageIndicator }}
					/>
				))}
			</div>
		</div>
	)
})
