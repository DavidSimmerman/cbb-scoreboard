import * as cheerio from 'cheerio';
import { dailyCache } from './dailyCache';

export async function fetchKenpom() {
	const { data, isFromCache, error } = await dailyCache('kenpom', async () => {
		const response = await fetch('https://kenpom.com/');
		const data = await response.text();

		const $ = cheerio.load(data);

		const rows = $('#ratings-table tbody tr');

		const rankings = Array.from(rows).reduce((acc: { [key: string]: number }, tr) => {
			const rankNode = $(tr).children().eq(0);
			const nameNode = $(tr).children().eq(1);

			acc[nameTranslator(nameNode.text())] = parseInt(rankNode.text());
			return acc;
		}, {});

		return rankings;
	});

	console.log('Kenpom rankings is from cache: ', isFromCache);

	return data;
}

function nameTranslator(name: string) {
	const fixMap = {
		"Hawai'i": 'Hawaii',
		'San José St': 'San Jose St.',
		'Fair Dickinson': 'Fairleigh Dickinson',
		'E Illinois': 'Eastern Illinois',
		'App State': 'Appalachian St.',
		'SF Austin': 'Stephen F. Austin',
		'St Francis PA': 'Saint Francis',
		'Miami': 'Miami FL',
		'St Thomas (MN)': 'St. Thomas',
		'SE Louisiana': 'Southeastern Louisiana',
		'UT Rio Grande': 'UT Rio Grande Valley',
		'SE Missouri': 'Southeast Missouri',
		'Ohio State': 'Ohio St.',
		'St': 'St.'
	};

	return Object.entries(fixMap).reduce((name, [replacement, replacer]) => name.replace(replacer, replacement), name);
}
