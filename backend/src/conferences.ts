export async function fetchConferences() {
	const response = await fetch(
		'https://site.web.api.espn.com/apis/site/v2/sports/basketball/mens-college-basketball/scoreboard/conferences?groups=50&seasontype=2'
	);
	const data = await response.json();

	return data.conferences.reduce((acc: any, curr: any) => {
		acc[curr.groupId] = {
			logo: curr.logo,
			name: curr.name,
			shortName: curr.shortName
		};
		return acc;
	}, {});
}
