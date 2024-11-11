import { memo, useEffect, useMemo, useState } from 'react'
import { type Connection } from '../domain/connection'
import { updateUpgradeDamage, Upgrade, UpgradeType } from '../domain/upgrade'
import { getStatsFromActiveUpgrades } from '../domain/stats'
import { ConnectionLine } from './ConnectionLine'
import { UpgradeNode } from './UpgradeNode'
import { useGameContext } from '../contexts/GameContext'
import {
	Area,
	clamp,
	equalPosition,
	getDistance,
	getSpeedVector,
	Identifier,
	isPositionInsideArea,
	lerp,
	Position,
} from '../domain/main'
import { Enemies } from './Enemies'
import { Enemy } from '../domain/enemy'
import { useMouse } from '@mantine/hooks'
import { HealthBar } from './HealthBar'
import { INITIAL_CONNECTIONS, INITIAL_UPGRADES } from '../data/initialGameData'
import { StatsInfoPlain } from './StatsInfoPlain'
import { BulletMeter } from './meters/BulletMeter'
import { Bullet } from '../domain/bullet'

// const enemyStats = {
// 	damage: 1,
// 	speed: 1000,
// }

const getGridPositionFromWindow = (
	windowPosition: Position,
	window: Window,
	gridScale: number
): Position => ({
	x: (windowPosition.x - window.innerWidth / 2) / gridScale,
	y: (windowPosition.y - window.innerHeight / 2) / gridScale,
})

type MouseArea = Area & {
	mouseLastActivatedTime: number
}

type ExperienceOrb = Identifier &
	Position & {
		amount: number
	}

function animateInwards(point: Position, target: Position): Position {
	const dx = point.x - target.x
	const dy = point.y - target.y
	const distance = getDistance(point, target)
	const angle = Math.atan2(dy, dx)
	const distanceStep = lerp(0.4, 0, clamp(0, 5)(distance) / 5)
	const moveDistance = Math.max(distanceStep, 0)
	const newAngle = angle + lerp(0.4, 0, clamp(0, 5)(distance) / 5)

	return {
		x: target.x + Math.max(0, distance - moveDistance) * Math.cos(newAngle),
		y: target.y + Math.max(0, distance - moveDistance) * Math.sin(newAngle),
	}
}

export const Stage = memo(() => {
	const { tick, timePassed, gridScale } = useGameContext()
	const [totalEnemiesDefeated, setTotalEnemiesDefeated] = useState(0)
	const [experienceOrbs, setExperienceOrbs] = useState<ExperienceOrb[]>([
		{
			amount: 1,
			id: '1',
			x: 3,
			y: 3,
		},
	])
	const [powerThroughEnemiesDefeated, setPowerThroughEnemiesDefeated] =
		useState(0)
	const [powerSpentOnAmmo, setPowerSpentOnAmmo] = useState(0)
	const [enemies, setEnemies] = useState<Enemy[]>([])
	const [upgrades, setUpgrades] = useState<Upgrade[]>(INITIAL_UPGRADES())
	const [ammo, setAmmo] = useState(10)
	const connections: Connection[] = useMemo(() => INITIAL_CONNECTIONS, [])
	const stats = useMemo(
		() =>
			getStatsFromActiveUpgrades(
				upgrades,
				powerThroughEnemiesDefeated,
				powerSpentOnAmmo
			),
		[upgrades, powerThroughEnemiesDefeated, powerSpentOnAmmo]
	)
	const mouse = useMouse()
	const [bullets, setBullets] = useState<Bullet[]>([])
	const gridMouse = useMemo(
		() => getGridPositionFromWindow(mouse, window, gridScale),
		[mouse, gridScale]
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
				...newEnemies
					.filter((enemy) => enemy.health <= 0)
					.map((enemy) => ({
						id: crypto.randomUUID(),
						amount: 1,
						x: enemy.x,
						y: enemy.y,
					})),
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

	// Reset game when motor life is 0
	useEffect(() => {
		const motor = upgrades.find((u) => u.type === UpgradeType.motor)!
		if (motor.health <= 0) {
			setUpgrades(INITIAL_UPGRADES())
			setEnemies([])
			setTotalEnemiesDefeated(0)
			setExperienceOrbs([])
			setPowerThroughEnemiesDefeated(0)
		}
	}, [upgrades])

	useEffect(() => {
		// update upgrade health on enemy attack
		setUpgrades((prevUpgrades) => {
			const upgradeIdsToTakeDamage = prevUpgrades
				.filter((upgrade) =>
					enemies.find((enemy) => equalPosition(upgrade, enemy))
				)
				.map((upgrade) => upgrade.id)
			// Specify the accumulator type in the `reduce` function
			const { upgrades: newUpgrades, bullets: newBullets } =
				prevUpgrades.reduce<{
					upgrades: Upgrade[]
					bullets: Bullet[]
				}>(
					({ upgrades, bullets }, upgrade) => {
						const canShoot =
							tick - upgrade.lastBulletShotTime >=
								stats.upgradeBulletAttackSpeed &&
							stats.upgradeBulletAttackDamage !== 0 &&
							upgrade.active &&
							ammo > 0

						if (!canShoot)
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
							lastBulletShotTime: tick,
						}
						// TODO: React.StrictMode makes this get added twice per tick in dev mode
						// we could add a tickFired prop and compare then.
						const newBullet = {
							id: crypto.randomUUID(),
							x: upgrade.x,
							y: upgrade.y,
							velocity: getSpeedVector(
								{ x: upgrade.x, y: upgrade.y },
								targetEnemy,
								0.1
							),
							enemyIdsHit: [],
						}

						return {
							upgrades: [...upgrades, updatedUpgrade],
							bullets: [...bullets, newBullet],
						}
					},
					{ upgrades: [], bullets: [] } // Initial value with the specified type
				)
			setAmmo((ammo) => ammo - newBullets.length)
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

			return upgradeIdsToTakeDamage.length
				? updateUpgradeDamage(
						upgradeIdsToTakeDamage,
						newUpgrades,
						connections,
						timePassed,
						stats
				  )
				: newUpgrades
		})

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
								enemy.health - stats.upgradeBulletAttackDamage,
					  }
					: enemy
			})
			const enemiesLeft = newEnemies.filter((enemy) => enemy.health > 0)
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
			return enemiesLeft
		})

		setExperienceOrbs((experienceOrbs) => {
			// Move orb
			const newExperienceOrbs = experienceOrbs.map((experienceOrb) => ({
				...experienceOrb,
				...animateInwards(experienceOrb, gridMouse),
			}))
			const experienceOrbsConsumed = newExperienceOrbs.filter(
				(experienceOrb) =>
					isPositionInsideArea(experienceOrb, {
						x: gridMouse.x - 1,
						y: gridMouse.y - 1,
						height: gridMouse.y + 2,
						width: gridMouse.x + 2,
					})
			)
			setPowerThroughEnemiesDefeated((prevPower) => {
				// const enemiesKilled = * stats.powerPerEnemy
				// XXX: Calculated gain is based on power - usedPower (difference to max)
				// e.g. [-----++   ] (5/10) - 5 power (+2 enemies), 0 used, 10 max
				const maxGainAllowed = Math.max(
					0,
					prevPower +
						experienceOrbsConsumed.length +
						stats.power -
						stats.usedPower
				)
				return clamp(
					0,
					maxGainAllowed
				)(prevPower + experienceOrbsConsumed.length)
			})
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
			<div className="absolute left-0 top-0">
				<p>grid</p>
				<p>x: {gridMouse.x}</p>
				<p>y: {gridMouse.y}</p>
				<p>area</p>
				<p>x: {mouseArea.x}</p>
				<p>y: {mouseArea.y}</p>
				<p>w: {mouseArea.width}</p>
				<p>h: {mouseArea.height}</p>
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
				<div
					className={`relative ${
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
				<div
					className="absolute top-0 left-0 w-full h-full"
					style={{
						transform: `translate(-${gridScale / 2}px,-${
							gridScale / 2
						}px)`,
					}}
				>
					{connections.map((connection) => (
						<ConnectionLine
							key={connection.id}
							{...{ connection, upgrades, stats }}
						/>
					))}
				</div>
				{upgrades.map((upgrade) => (
					<UpgradeNode
						key={upgrade.id}
						{...{
							upgrade,
							upgrades,
							setUpgrades,
							stats,
							connections,
						}}
					/>
				))}
				<div
					className="absolute border-2 bg-gray-800 border-red-900"
					style={{
						width: 1 * gridScale - gridScale / 2,
						height: 2 * gridScale - gridScale / 2,
						top: `${
							2 * gridScale + gridScale / 4 - gridScale / 2
						}px`,
						left: `${
							-2 * gridScale + gridScale / 4 - gridScale / 2
						}px`,
					}}
				>
					<div className="font-bold font-mono absolute -rotate-90 origin-top-left top-10 -left-6">
						Power
					</div>

					<div
						className="absolute w-full bottom-0 bg-amber-300"
						style={{
							height: `${
								((stats.power - stats.usedPower) /
									stats.maxPower) *
								100
							}%`,
						}}
					></div>
					<div className="font-bold font-mono absolute -rotate-90 origin-top-left left-6 top-10">
						{stats.power - stats.usedPower}/{stats.maxPower}
					</div>
				</div>
				<BulletMeter
					{...{
						ammo,
						setAmmo,
						setPowerSpentOnAmmo,
						stats,
					}}
				/>
			</div>
			<Enemies
				{...{
					bullets,
					upgrades,
					enemies,
					setEnemies,
				}}
			/>
			<div
				className="absolute right-0 top-0 w-full h-full pointer-events-none"
				style={{
					transform: 'translate(50%, 50%)',
				}}
			>
				{bullets.map((bullet) => (
					<div
						className="absolute bg-amber-400 rounded-full"
						key={bullet.id}
						style={{
							transform: 'translate(-50%, -50%)',
							width: `${gridScale / 6}px`,
							height: `${gridScale / 6}px`,
							left: `${bullet.x * gridScale + gridScale / 2}px`,
							top: `${bullet.y * gridScale + gridScale / 2}px`,
						}}
					/>
				))}
				{experienceOrbs.map((experienceOrb) => (
					<div
						className="absolute bg-blue-600 rounded-full"
						key={experienceOrb.id}
						style={{
							transform: 'translate(-50%, -50%)',
							width: `${gridScale / 6}px`,
							height: `${gridScale / 6}px`,
							left: `${
								experienceOrb.x * gridScale + gridScale / 6
							}px`,
							top: `${
								experienceOrb.y * gridScale + gridScale / 6
							}px`,
						}}
					/>
				))}
			</div>
		</div>
	)
})
