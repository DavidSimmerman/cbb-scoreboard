import express, { Request, Response } from 'express';
import cors from 'cors';
import { getScorebaord } from './scoreboard';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

app.get('/', (req: Request, res: Response) => {
	res.send('Hello World');
});

interface ScoreboardResponse {
	games: any;
	conferences: any;
	rawGames?: any;
	error?: string;
}
app.get('/scoreboard', async (req: Request, res: Response) => {
	let responseData: ScoreboardResponse = { games: undefined, conferences: undefined };
	try {
		const { games, rawGames, conferences } = await getScorebaord();
		responseData.games = games;
		responseData.rawGames = rawGames;
		responseData.conferences = conferences;
	} catch (err) {
		console.error(err);
		if (err instanceof Error) {
			responseData.error = err.message;
		} else {
			responseData.error = String(err);
		}
	} finally {
		res.json(responseData);
	}
});

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}.`);
});
