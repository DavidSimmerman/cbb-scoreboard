import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import useGamesStore from '../../stores/useGamesStore';
import ScoreCard from './ScoreCard';
import { useMemo } from 'react';
import ScoreSection from './ScoreSection';

const POWER_CONFERENCES = ['ACC', 'Big East', 'Big Ten', 'Big 12', 'SEC'];

export default function Scoreboard() {
	const { loading, games, conferences } = useGamesStore();

	const { inProgressGames, upCommingGames, finishedGames } = useMemo(() => {
		return (
			games?.reduce(
				(acc, curr) => {
					let heatLevel;
					const [team1Rank, team2Rank] = curr.teams.map(team => Math.min(team.rank ?? 500, team.kenpom ?? 500));

					const highestRank = Math.min(team1Rank, team2Rank);
					const lowestRank = Math.max(team1Rank, team2Rank);
					const teamDiff = Math.abs(team1Rank - team2Rank);

					if (lowestRank <= 15) {
						heatLevel = 5;
					} else if (lowestRank <= 25) {
						if (teamDiff <= 15) heatLevel = 4.5;
						else heatLevel = 4;
					} else if (lowestRank <= 50) {
						if (teamDiff <= 20) heatLevel = 3.5;
						else heatLevel = 3;
					} else if (lowestRank <= 100) {
						if (teamDiff <= 20) heatLevel = 2;
						else heatLevel = 1;
					} else if (highestRank <= 25) {
						heatLevel = 1;
					} else {
						heatLevel = 0;
					}

					if (curr.status === 'pregame') {
						if (curr.teams[0].rank && curr.teams[1].rank) {
							acc.upCommingGames.top25matchups.push(curr);
						} else if (heatLevel >= 3.5 || curr.teams[0].rank || curr.teams[1].rank) {
							acc.upCommingGames.gamesOfInterest.push(curr);
						}

						getConferences(curr.teams).forEach(conf => acc.upCommingGames.conferences[conf].push(curr));
					} else if (curr.status === 'final') {
						if (curr.teams.find(team => team.rank && team.isLoser)) {
							acc.finishedGames.top25losses.push(curr);
						} else if (heatLevel >= 3 || curr.teams.find(team => team.rank)) {
							acc.finishedGames.gamesOfInterest.push(curr);
						}

						getConferences(curr.teams).forEach(conf => acc.finishedGames.conferences[conf].push(curr));
					} else {
						if (curr.teams[0].rank && curr.teams[1].rank) {
							acc.inProgressGames.mustWatch.push(curr);
						} else if (heatLevel >= 3.5 || curr.teams[0].rank || curr.teams[1].rank) {
							acc.inProgressGames.keepAnEyeOn.push(curr);
						} else if (heatLevel > 0) {
							acc.inProgressGames.gamesOfInterest.push(curr);
						}

						getConferences(curr.teams).forEach(conf => acc.inProgressGames.conferences[conf].push(curr));
					}

					curr.heatLevel = heatLevel;

					return acc;
				},
				{
					inProgressGames: {
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
					},
					upCommingGames: {
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
					},
					finishedGames: {
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
					}
				}
			) || {}
		);
	}, [games]);

	function getConferences([team1, team2]) {
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

	return !loading ? (
		<Accordion type="multiple" collapsible className="p-4">
			<AccordionItem value="in-progress">
				<AccordionTrigger>In Progress...</AccordionTrigger>
				<AccordionContent>
					<ScoreSection section={inProgressGames} />
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="up-comming">
				<AccordionTrigger>Up Comming...</AccordionTrigger>
				<AccordionContent>
					<ScoreSection section={upCommingGames} />
				</AccordionContent>
			</AccordionItem>
			<AccordionItem value="finished">
				<AccordionTrigger>Finished...</AccordionTrigger>
				<AccordionContent>
					<ScoreSection section={finishedGames} />
				</AccordionContent>
			</AccordionItem>
		</Accordion>
	) : (
		<div>Loading...</div>
	);
}
