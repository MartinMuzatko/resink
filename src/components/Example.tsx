import { Button } from '@mantine/core'
import { useState } from 'react'

export const Example = () => {
	const [maxPower, setMaxPower] = useState(5)
	const [usingPower, setUsingPower] = useState(0)
	const [generatedPower, setGeneratedPower] = useState(0)
	const [powerThroughEnemies, setPowerThroughEnemies] = useState(0)

	return (
		<>
			<div>
				<div>maxPower: {maxPower} </div>
				<Button
					onClick={() => {
						setMaxPower((maxPower) => maxPower + 1)
					}}
				>
					+
				</Button>{' '}
				<Button
					onClick={() => {
						setMaxPower((maxPower) => maxPower - 1)
					}}
				>
					-
				</Button>
				<br />
				<div>usingPower: {usingPower} </div>
				<Button
					onClick={() => {
						setUsingPower((usingPower) => usingPower + 1)
					}}
				>
					+
				</Button>{' '}
				<Button
					onClick={() => {
						setUsingPower((usingPower) => usingPower - 1)
					}}
				>
					-
				</Button>
				<br />
				<div>generatedPower: {generatedPower} </div>
				<Button
					onClick={() => {
						setGeneratedPower(
							(generatedPower) => generatedPower + 1
						)
					}}
				>
					+
				</Button>{' '}
				<Button
					onClick={() => {
						setGeneratedPower(
							(generatedPower) => generatedPower - 1
						)
					}}
				>
					-
				</Button>
				<br />
				<div>powerThroughEnemies: {powerThroughEnemies} </div>
				<Button
					onClick={() => {
						setPowerThroughEnemies(
							(powerThroughEnemies) => powerThroughEnemies + 1
						)
					}}
				>
					+
				</Button>{' '}
				<Button
					onClick={() => {
						setPowerThroughEnemies(
							(powerThroughEnemies) => powerThroughEnemies - 1
						)
					}}
				>
					-
				</Button>
				<br />
			</div>
		</>
	)
}
