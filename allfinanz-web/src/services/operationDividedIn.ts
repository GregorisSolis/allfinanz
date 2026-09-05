import { API } from './api'
import { date_now } from './dateCreate'


export async function setDividedInTransaction(
	value: number,
	description: string,
	category: string,
	type: string,
	source: string,
	card: string,
	dividedIn: number,
	isDivided: boolean,
	fixed: boolean,
	baseDateStr?: string
) {
	const baseDate = new Date(`${baseDateStr || date_now()}T12:00:00`);
	const installmentValue = Math.floor(value / dividedIn);
	const remainder = value % dividedIn;

	const requests = Array.from({ length: dividedIn }, (_, index) => {
		const installmentDate = new Date(baseDate);
		installmentDate.setMonth(baseDate.getMonth() + index);
		installmentDate.setDate(1);

		return API.post(
			'/transaction/',
			{
				source,
				amount: installmentValue + (index < remainder ? 1 : 0),
				description,
				category,
				type,
				date: installmentDate.toISOString().slice(0, 10),
				card,
				dividedIn,
				isDivided,
				fixed
			},
			{ withCredentials: true }
		);
	});

	await Promise.all(requests);
}
