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
	Position,
} from '../domain/main'
import { Enemies } from './Enemies'
import { Enemy } from '../domain/enemy'
import { useMouse } from '@mantine/hooks'
import { HealthBar } from './HealthBar'
import { INITIAL_CONNECTIONS, INITIAL_UPGRADES } from '../data/initialGameData'
import { StatsInfoPlain } from './StatsInfoPlain'
import { GiConsoleController } from 'react-icons/gi'
import { Tooltip } from '@mantine/core'
import { BsLightningChargeFill } from 'react-icons/bs'

// const enemyStats = {
// 	damage: 1,
// 	speed: 1000,
// }

const getGridPositionFromWindow = (
	windowPosition: Position,
	window: Window,
	gridScale: number
): Position => ({
	x: (windowPosition.x - window.innerWidth / 2 - gridScale / 2) / gridScale,
	y: (windowPosition.y - window.innerHeight / 2 - gridScale / 2) / gridScale,
})

type MouseArea = Area & {
	mouseLastActivatedTime: number
}

export type Bullet = Position &
	Identifier & {
		velocity: {
			x: number
			y: number
		}
		enemyIdsHit: string[]
	}

export const Stage = memo(() => {
	const { tick, timePassed, gridScale } = useGameContext()
	const [totalEnemiesDefeated, setTotalEnemiesDefeated] = useState(0)
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
	// const gridMouse = useMemo(
	// 	() => getGridPositionFromWindow(mouse, window, gridScale),
	// 	[mouse]
	// )

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
			const enemiesLeft = prevEnemies
				.map((enemy) =>
					// TODO: real bounding box checking
					isPositionInsideArea(enemy, mouseArea)
						? {
								...enemy,
								health: enemy.health - stats.mouseAttackDamage,
						  }
						: enemy
				)
				.filter((enemy) => enemy.health > 0)
			setPowerThroughEnemiesDefeated((prevPower) => {
				const enemiesKilled =
					(prevEnemies.length - enemiesLeft.length) *
					stats.powerPerEnemy
				// XXX: Calculated gain is based on power - usedPower (difference to max)
				// e.g. [-----++   ] (5/10) - 5 power (+2 enemies), 0 used, 10 max
				const maxGainAllowed = Math.max(
					0,
					prevPower + enemiesKilled + stats.power - stats.usedPower
				)
				return clamp(0, maxGainAllowed)(prevPower + enemiesKilled)
			})
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
			const enemiesLeft = prevEnemies
				.map((enemy) => {
					const bulletsHitIds = bullets
						.filter((bullet) =>
							isPositionInsideArea(enemy, {
								x: bullet.x - 0.5,
								y: bullet.y - 0.5,
								height: 1,
								width: 1,
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
				.filter((enemy) => enemy.health > 0)
			setPowerThroughEnemiesDefeated((prevPower) => {
				const enemiesKilled = prevEnemies.length - enemiesLeft.length
				// XXX: Calculated gain is based on power - usedPower (difference to max)
				// e.g. [-----++   ] (5/10) - 5 power (+2 enemies), 0 used, 10 max
				const maxGainAllowed = Math.max(
					0,
					prevPower + enemiesKilled + stats.power - stats.usedPower
				)
				return clamp(0, maxGainAllowed)(prevPower + enemiesKilled)
			})
			setTotalEnemiesDefeated(
				(totalEnemiesDefeated) =>
					totalEnemiesDefeated +
					prevEnemies.length -
					enemiesLeft.length
			)
			return enemiesLeft
		})
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [tick])

	return (
		<div className="w-full h-full top-0 left-0 absolute" ref={mouse.ref}>
			<div
				className={`absolute ${
					mouseLastActivatedTime > timePassed - 500
						? 'bg-orange-200/80'
						: 'bg-orange-400/50'
				}`}
				style={{
					top: `${
						mouseArea.y * gridScale +
						window.innerHeight / 2 +
						gridScale / 2
					}px`,
					left: `${
						mouseArea.x * gridScale +
						window.innerWidth / 2 +
						gridScale / 2
					}px`,
					width: `${mouseArea.width * gridScale}px`,
					height: `${mouseArea.height * gridScale}px`,
				}}
			>
				<HealthBar
					current={timePassed - mouseLastActivatedTime}
					max={stats.mouseSpeed}
				/>
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
				{connections.map((connection) => (
					<ConnectionLine
						key={connection.id}
						{...{ connection, upgrades, stats }}
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
						}}
					/>
				))}
				<div
					className="absolute border-2 bg-gray-800 border-red-900"
					style={{
						width: 1 * gridScale - gridScale / 2,
						height: 2 * gridScale - gridScale / 2,
						top: `${2 * gridScale + gridScale / 4}px`,
						left: `${-2 * gridScale + gridScale / 4}px`,
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
				<Tooltip
					label={
						<div className="flex items-center ">
							Refill for{' '}
							{Math.ceil((stats.upgradeBulletMaxAmmo - ammo) / 2)}
							<BsLightningChargeFill className="ml-1" />
						</div>
					}
					position="right-end"
				>
					<div
						onClick={() => {
							const toSpend = Math.ceil(
								(stats.upgradeBulletMaxAmmo - ammo) / 2
							)
							if (
								stats.power - stats.usedPower < toSpend ||
								ammo === stats.upgradeBulletMaxAmmo
							)
								return
							setAmmo(stats.upgradeBulletMaxAmmo)
							setPowerSpentOnAmmo((ammo) => ammo + toSpend)
						}}
						className="absolute z-30  border-2 cursor-pointer bg-gray-800 border-red-900"
						style={{
							width: 1 * gridScale - gridScale / 2,
							height: 2 * gridScale - gridScale / 2,
							top: `${-2 * gridScale + gridScale / 4}px`,
							left: `${3 * gridScale + gridScale / 4}px`,
						}}
					>
						<div className="font-bold font-mono absolute -rotate-90 origin-top-left top-24 -left-6">
							Bullet&nbsp;Ammo
						</div>

						<div
							className="absolute w-full bottom-0 bg-amber-600"
							style={{
								height: `${
									(ammo / stats.upgradeBulletMaxAmmo) * 100
								}%`,
							}}
						></div>
						<div className="font-bold font-mono absolute -rotate-90 origin-top-left left-6 top-10">
							{ammo}/{stats.upgradeBulletMaxAmmo}
						</div>
					</div>
				</Tooltip>
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
			</div>
		</div>
	)
})
