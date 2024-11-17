import { useEffect } from 'react';
import Scoreboard from './components/Scoreboard/Scoreboard';

function App() {
	useEffect(() => {
		document.documentElement.classList.add('dark');
	}, []);

	return (
		<>
			<Scoreboard />
		</>
	);
}

export default App;
