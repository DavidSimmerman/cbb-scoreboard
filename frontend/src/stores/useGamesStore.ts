import { create } from 'zustand';

const POWER_CONFERENCES = ['ACC', 'Big East', 'Big Ten', 'Big 12', 'SEC'];

const useGamesStore = create(set => {
	async function fetchData() {
		set({ loading: true });

		const response = await fetch('http://localhost:3000/scoreboard');
		const data = await response.json();

		const inProgressGames = {
			mustWatch: [],
			keepAnEyeOn: [],
			gamesOfInterest: [],
			conferences: {
				bigten: [],
				big12: [],
				sec: [],
				acc: [],
				bigeast: [],
				g5: []
			}
		};
		const upCommingGames = {
			top25matchups: [],
			gamesOfInterest: [],
			conferences: {
				bigten: [],
				big12: [],
				sec: [],
				acc: [],
				bigeast: [],
				g5: []
			}
		};
		const finishedGames = {
			top25losses: [],
			gamesOfInterest: [],
			conferences: {
				bigten: [],
				big12: [],
				sec: [],
				acc: [],
				bigeast: [],
				g5: []
			}
		};

		data.games.forEach(game => {
			const involvedConfs = getConferences(game.teams, data.conferences);
		});

		set({ games: data.games, conferences: data.conferences, loading: false });
	}

	fetchData();

	return {
		games: undefined,
		conferences: undefined,
		loading: true,
		refetch: fetchData
	};
});

function getGamePriority(game) {
	const teams = game.teams;
	const [team1Rank, team2Rank] = teams.map(team => Math.min(team.rank ?? 500, team.kenpom ?? 500));
	const highestRank = Math.min(team1Rank, team2Rank);
	const lowestRank = Math.max(team1Rank, team2Rank);
	const teamDiff = Math.abs(team1Rank - team2Rank);

	if (game.status === 'pregame') {
		if (team1Rank <= 25 && team2Rank <= 25) return 'Premire Games';
		else if ((highestRank <= 25 && lowestRank <= 50) || (lowestRank <= 50 && teamDiff <= 15)) return 'Good Matchups';
		else if (highestRank <= 25 || (lowestRank <= 100 && teamDiff <= 25)) return 'More to watch';
	} else if (game.status === 'final') {
		if (teams.find(team => team.rank >= 25 && team.isLoser)) return 'Biggest Games';
		else if (highestRank <= 25) return 'Top 25 Teams';
		else if (lowestRank <= 50) return 'Top 50 Matchups';
		else if (lowestRank <= 100) return 'Top 100 Matchups';
	} else {
		//		turn on now
		//			top 25 competitive
		//			upset watch
		//		keep an eye on
		//			top 25 blowout
		//			top 25 losing
		//		more to watch
		//			top 25
		//			top 50 competitive
		//			top 100 close
		//			top 50 losing
	}
}

function getConferences([team1, team2], conferences) {
	const involvedConfs = [];

	const team1conf = conferences[team1.conference]?.shortName;
	const isTeam1P5 = POWER_CONFERENCES.find(c => c === team1conf);
	const team2conf = conferences[team2.conference]?.shortName;
	const isTeam2P5 = POWER_CONFERENCES.find(c => c === team1conf);

	if (isTeam1P5) {
		involvedConfs.push(team1conf.toLowerCase().replaceAll(' ', ''));
	} else {
		involvedConfs.push('g5');
	}

	if (team1conf !== team2conf && isTeam1P5 !== isTeam2P5) {
		if (isTeam2P5) {
			involvedConfs.push(team2conf.toLowerCase().replaceAll(' ', ''));
		} else {
			involvedConfs.push('g5');
		}
	}

	return involvedConfs;
}

export default useGamesStore;
