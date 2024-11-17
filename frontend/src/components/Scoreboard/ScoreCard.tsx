export default function ScoreCard({ game }) {
	const heatStyles = [
		'w-0',
		'w-2/12 bg-yellow-500/20',
		'w-3/12 bg-yellow-500/30',
		'w-4/12 bg-yellow-500/40',
		'w-5/12 bg-orange-500/50',
		'w-6/12 bg-orange-500/60',
		'w-7/12 bg-orange-500/70',
		'w-8/12 bg-red-600/70',
		'w-9/12 bg-red-600/80',
		'w-10/12 bg-red-600/90',
		'w-full bg-red-600'
	];

	let timeText;
	if (['half', 'final'].includes(game.status)) {
		timeText = game.status;
	} else if (game.status === 'pregame') {
		timeText = game.startTime;
	} else {
		timeText = `${game.displayClock} - ${game.status}`;
	}

	return (
		<div
			className="border border-neutral-800 bg-neutral-900 rounded-lg p-3 pb-4 min-w-52 relative"
			// style={{ boxShadow: '0 0 6px 1px limegreen' }}
		>
			<div className="flex justify-between">
				<div className="uppercase">{timeText}</div> <div className="text-gray-400 text-xs">{game.channel}</div>
			</div>
			<div>
				{game.teams
					.sort(a => (a.isHome ? 1 : -1))
					.map(team => {
						return (
							<div className="flex justify-between" key={`team_score_${team.shortName}`}>
								<div className="flex gap-2 items-center">
									<img
										className="w-5 h-5"
										src={`https://a.espncdn.com/combiner/i?img=/i/teamlogos/ncaa/500/${team.id}.png&scale=crop&cquality=40&location=origin&w=40&h=40`}
									/>
									<div>
										{team.rank || ''} {team.shortName}{' '}
										<span className="text-gray-400 text-xs">
											({team.record.wins}-{team.record.losses}) {team.kenpom ? `kp${team.kenpom}` : ''}
										</span>
									</div>
								</div>
								<div className={team.isLoser && 'text-gray-400'}>
									{game.status === 'pregame' ? '-' : team.score}
								</div>
							</div>
						);
					})}
			</div>
			<div className="h-1 inset-x-4 bottom-1 absolute bg-neutral-800">
				<div className={`h-full m-auto ${heatStyles[Math.ceil(game.heatLevel) || 0]} ${game.heatLevel}`}></div>
			</div>
		</div>
	);
}
