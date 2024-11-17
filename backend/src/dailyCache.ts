import path from 'path';
import { promises as fs } from 'fs';

interface DailyCacheReturn {
	data?: any;
	isFromCache?: boolean;
	error?: any;
}
export async function dailyCache(key: string, fetcher: Function): Promise<DailyCacheReturn> {
	try {
		const cacheFolder = path.join(__dirname, '../cache');
		const cacheFilePath = path.join(cacheFolder, `${key}_cache.json`);

		const today = new Date();
		const month = today.getMonth() + 1;
		const day = today.getDate();
		const dateStamp = `${month}/${day}`;

		const cacheFileExists = await doesFileExist(cacheFilePath);

		const data: DailyCacheReturn = {};

		if (!cacheFileExists) {
			await ensureDirExists(cacheFolder);
			const newData = await writeCache(cacheFilePath, fetcher, dateStamp);
			data.data = newData;
			data.isFromCache = false;
		} else {
			const cachedData = await getCache(cacheFilePath);
			if (cachedData?.date !== dateStamp) {
				const newData = await writeCache(cacheFilePath, fetcher, dateStamp);
				data.data = newData;
				data.isFromCache = false;
			} else {
				data.data = cachedData.data;
				data.isFromCache = true;
			}
		}

		return data;
	} catch (err: any) {
		console.error(err);
		return { error: err.message };
	}
}

function doesFileExist(path: string) {
	return fs
		.access(path)
		.then(() => true)
		.catch(() => false);
}

async function ensureDirExists(dir: string) {
	await fs.mkdir(dir, { recursive: true });
}

async function getCache(filePath: string) {
	const rawData = await fs.readFile(filePath, 'utf8');
	return JSON.parse(rawData || '{}');
}

async function writeCache(filePath: string, fetcher: Function, dateStamp: string) {
	const newData = await fetcher();

	const cacheContents = JSON.stringify({
		data: newData,
		date: dateStamp
	});

	fs.writeFile(filePath, cacheContents, 'utf8');

	return newData;
}
