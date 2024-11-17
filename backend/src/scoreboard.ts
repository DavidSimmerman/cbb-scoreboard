import { fetchConferences } from './conferences';
import { fetchKenpom } from './kenpom';
import { getTimeString } from './utils/dates';

interface ScoreboardReturn {
	games: any;
	rawGames: any;
	conferences: any;
}

export async function getScorebaord(): Promise<ScoreboardReturn> {
	const [rawGames, kenpom, conferences] = await Promise.all([fetchScoreboard(), fetchKenpom(), fetchConferences()]);

	const parsedGames = formatGames(rawGames, kenpom);

	return { rawGames, games: parsedGames, conferences };
}

async function fetchScoreboard(params = {}) {
	const query = new URLSearchParams({
		region: 'us',
		lang: 'en',
		contentorigin: 'espn',
		limit: '300',
		calendartype: 'offdays',
		includeModules: 'videos',
		dates: '20241111',
		seasontype: '2',
		groups: '50',
		tz: 'America%2FNew_York',
		...params
	});
	const response = await fetch(
		`https://site.web.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard?${query.toString()}`
	);
	if (!response.ok) throw response.status;
	const data = await response.json();
	return data.events;
}

function formatGames(games: any, kenpom: any) {
	return games.map((g: any) => {
		const rawGame = g.competitions[0];

		let status: string;
		if (rawGame.status.type.completed) {
			status = 'final';
		} else if (rawGame.status.period === 0) {
			status = 'pregame';
		} else if (rawGame.status.period === 1) {
			if (rawGame.status.clock === 0) {
				status = 'half';
			} else {
				status = '1st';
			}
		} else if (rawGame.status.period === 2) {
			if (rawGame.status.clock === 0) {
				status = 'end of 2nd';
			} else {
				status = '2nd';
			}
		} else {
			status = '';
		}

		return {
			id: g.id,
			channel: rawGame.broadcast.split('/')[0],
			isConferenceGame: rawGame.conferenceCompetition,
			startTime: getTimeString(rawGame.date),
			startTimeUnix: new Date(rawGame.date).getTime(),
			neutralSite: rawGame.neutralSite,
			clock: rawGame.status.clock,
			displayClock: rawGame.status.displayClock,
			status,
			teams: rawGame.competitors.map((team: any) => {
				const [wins, losses] = team.records?.[0]?.summary.split('-') || [0, 0];
				const [confWins, confLosses] = team.records?.[3]?.summary.split('-') || [0, 0];
				return {
					rank: team.curatedRank.current <= 25 ? team.curatedRank.current : undefined,
					isHome: team.homeAway === 'home',
					id: team.id,
					record: {
						wins: parseInt(wins),
						losses: parseInt(losses)
					},
					conferenceRecord: {
						wins: parseInt(confWins),
						losses: parseInt(confLosses)
					},
					score: parseInt(team.score),
					shortName: team.team.abbreviation,
					name: team.team.displayName,
					school: team.team.shortDisplayName,
					mascot: team.team.name,
					kenpom: kenpom[team.team.shortDisplayName],
					isWinner: team.winner,
					isLoser: status === 'final' ? !team.winner : undefined,
					conference: team.team.conferenceId
				};
			})
		};
	});
}
