import { MantineProvider } from '@mantine/core'
import { Game } from './Game'
import '@mantine/core/styles.css'
import { Example } from './Example'

const App: React.FC = () => {
	return (
		<>
			<MantineProvider>
				<Game />
				{/* <Example /> */}
			</MantineProvider>
		</>
	)
}

export default App
