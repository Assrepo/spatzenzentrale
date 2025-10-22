export function getCurrentDate(): string {
	const date = new Date();
	const monthNames = [
		'Januar',
		'Februar',
		'März',
		'April',
		'Mai',
		'Juni',
		'Juli',
		'August',
		'September',
		'Oktober',
		'November',
		'Dezember'
	];
	return `${date.getDate()}. ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
}

export function getCurrentTime(): string {
	const date = new Date();
	const pad = (v: number) => (v < 10 ? '0' : '') + v;
	return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}
