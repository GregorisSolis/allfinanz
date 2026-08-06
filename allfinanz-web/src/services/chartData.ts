import { categoryOptions } from './categoryOptions'

export interface ChartTransaction {
	_id: string
	amount: number
	description: string
	category?: number | string
	type?: number | string
	date?: string
	fixed?: boolean
	card?: string
	source?: 'salary' | 'carryover' | 'savings'
}

export interface SpendPoint {
	day: number
	label: string
	actual: number
	ideal: number
}

const PALETTE = [
	'#34d399',
	'#38bdf8',
	'#fbbf24',
	'#a78bfa',
	'#fb7185',
	'#4ade80',
	'#f472b6',
	'#60a5fa',
	'#facc15',
	'#c084fc',
	'#2dd4bf',
	'#f87171',
	'#a3e635',
	'#22d3ee',
];

export function getCategoryName(category?: number | string) {
	const index = Number(category);
	if (!Number.isNaN(index) && categoryOptions[index]) {
		return categoryOptions[index].name;
	}
	return 'Outros';
}

export function getCategoryColor(index: number) {
	return PALETTE[index % PALETTE.length];
}

export function getCategoryColorByName(category?: number | string) {
	const index = Number(category);
	const name = getCategoryName(category);
	if (categoryOptions[index]?.name === name) return PALETTE[index % PALETTE.length];
	const option = categoryOptions.find(item => item.name === name);
	return option ? PALETTE[option._id % PALETTE.length] : PALETTE[0];
}

function toNumber(value: number | string | undefined) {
	const num = Number(value);
	return Number.isFinite(num) ? num : 0;
}

export function sumAmount(items: ChartTransaction[]) {
	return items.reduce((total, item) => total + toNumber(item.amount), 0);
}

export function aggregateByCategory(items: ChartTransaction[]) {
	const map = new Map<string, { name: string; value: number; color: string }>();
	items.forEach(item => {
		const name = getCategoryName(item.category);
		const current = map.get(name) || { name, value: 0, color: getCategoryColorByName(item.category) };
		current.value += toNumber(item.amount);
		map.set(name, current);
	});
	return Array.from(map.values())
		.sort((a, b) => b.value - a.value);
}

export function buildSpendSeries(
	items: ChartTransaction[],
	period: { start: string; end: string; totalDays: number },
	totalExpenses: number
): SpendPoint[] {
	const start = new Date(`${period.start}T00:00:00`);
	const totalDays = Math.max(1, Math.floor(period.totalDays) || 0);

	const perDay = new Array(totalDays).fill(0);
	items.forEach(item => {
		const date = item.date ? new Date(item.date) : null;
		if (!date || Number.isNaN(date.getTime())) return;
		const day = Math.floor((date.getTime() - start.getTime()) / 86400000);
		if (day >= 0 && day < totalDays) {
			perDay[day] += toNumber(item.amount);
		}
	});

	const points: SpendPoint[] = [];
	let running = 0;
	for (let i = 0; i < totalDays; i++) {
		running += perDay[i];
		const date = new Date(start.getTime() + i * 86400000);
		points.push({
			day: i + 1,
			label: date.toLocaleDateString('pt-BR', { timeZone: 'UTC', day: '2-digit', month: '2-digit' }),
			actual: running,
			ideal: (totalExpenses / totalDays) * (i + 1),
		});
	}
	return points;
}

export function getCurrentDayIndex(period: { start: string }, totalDays: number) {
	const now = new Date();
	const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const periodStart = new Date(`${period.start}T00:00:00`).getTime();
	return Math.max(0, Math.min(totalDays - 1, Math.floor((today - periodStart) / 86400000)));
}
