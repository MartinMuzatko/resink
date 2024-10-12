import { MantineProvider } from '@mantine/core'
import { Game } from './Game'
import '@mantine/core/styles.css'

const App: React.FC = () => {
	return (
		<>
			<MantineProvider>
				<Game />
			</MantineProvider>
		</>
	)
}

export default App
