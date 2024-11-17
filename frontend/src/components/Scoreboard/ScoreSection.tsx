import { useMemo } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import ScoreCard from './ScoreCard';

export default function ScoreSection({ section }) {
	const { conferences, ...groups } = section;

	const hasGames = useMemo(() => !!Object.values(conferences).find(games => games.length), [section]);

	return (
		<div>
			{Object.entries(groups).map(([id, games]) =>
				games.length ? (
					<div key={id}>
						<div>{id}</div>
						<div className="overflow-scroll">
							<div className="flex gap-3 p-1">
								{games.map(game => (
									<ScoreCard game={game} />
								))}
							</div>
						</div>
					</div>
				) : (
					<></>
				)
			)}
			<Accordion collapsible>
				<AccordionItem value="conferences">
					<AccordionTrigger>Conferences</AccordionTrigger>
					<AccordionContent>
						{Object.entries(conferences).map(([id, games]) =>
							games.length ? (
								<div key={id}>
									<div>{id}</div>
									<div className="overflow-scroll">
										<div className="flex gap-3 p-1">
											{games.map(game => (
												<ScoreCard game={game} />
											))}
										</div>
									</div>
								</div>
							) : (
								<></>
							)
						)}
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
