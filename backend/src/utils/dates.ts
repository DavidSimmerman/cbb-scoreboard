export function getTimeString(date: string | Date) {
	if (typeof date === 'string') {
		date = new Date(date);
	}

	let hours = date.getHours();
	let minutes: any = date.getMinutes();
	const ampm = hours >= 12 ? 'PM' : 'AM';

	hours = hours % 12;
	hours = hours ? hours : 12;
	minutes = minutes < 10 ? '0' + minutes : minutes;

	const strTime = hours + ':' + minutes + ' ' + ampm;
	return strTime;
}
