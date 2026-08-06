import { useState } from 'react'
import {
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
	Tooltip,
	AreaChart,
	Area,
	XAxis,
	YAxis,
	CartesianGrid,
	BarChart,
	Bar,
	ReferenceLine,
} from 'recharts'
import { FiPieChart, FiTrendingUp, FiBarChart2, FiShield, FiCheckCircle, FiAlertTriangle, FiAlertCircle } from 'react-icons/fi'
import { formatToBRL_report } from '../services/amountFormat'
import {
	ChartTransaction,
	SpendPoint,
	aggregateByCategory,
	buildSpendSeries,
	getCurrentDayIndex,
	sumAmount,
} from '../services/chartData'

export interface ChartReportMoney {
	salary: number
	fixedExpenses: number
	variableExpenses: number
	totalExpenses: number
	available: number
	dailyLimit: number
	leisureSpent: number
	leisureAvailable: number
	savingsSpent: number
}

export interface DashboardChartsProps {
	period: { start: string; end: string; totalDays: number }
	money: ChartReportMoney
	fixedTransactions: ChartTransaction[]
	variableTransactions: ChartTransaction[]
}

const EMERALD = '#34d399'
const ROSE = '#fb7185'
const SLATE = '#64748b'
const GRID = 'rgba(255,255,255,0.06)'

function ChartCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
	return (
		<div className={`rounded-lg border border-white/10 bg-[#0d1117] p-5 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] ${className}`}>
			{children}
		</div>
	)
}

function SectionTitle({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
	return (
		<div className="mb-4">
			<div className="flex items-center gap-2 text-sm font-semibold text-white">
				<span className="text-emerald-300">{icon}</span>
				{title}
			</div>
			<p className="mt-1 text-xs text-slate-400">{subtitle}</p>
		</div>
	)
}

function compactBRL(value: number) {
	return formatToBRL_report(value)
}

function SpendByCategory({ items, total }: { items: ChartTransaction[]; total: number }) {
	const [hoveredIndex, setHoveredIndex] = useState(-1)
	const data = aggregateByCategory(items)
	const grandTotal = sumAmount(items)

	if (data.length === 0) {
		return (
			<div className="flex min-h-[300px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
				<p className="text-sm text-slate-400">Sem gastos variáveis no período.</p>
			</div>
		)
	}

	return (
		<div className="grid items-center gap-2 sm:grid-cols-2">
			<div className="relative h-[260px]">
				<ResponsiveContainer width="100%" height="100%">
					<PieChart>
						<Pie
							data={data}
							dataKey="value"
							nameKey="name"
							innerRadius="62%"
							outerRadius="88%"
							paddingAngle={2}
							stroke="none"
							onMouseEnter={(_, index) => setHoveredIndex(index)}
							onMouseLeave={() => setHoveredIndex(-1)}
						>
							{data.map((entry, index) => (
								<Cell key={entry.name} fill={entry.color} opacity={hoveredIndex === -1 || hoveredIndex === index ? 1 : 0.35} />
							))}
						</Pie>
						<Tooltip
							content={({ active, payload }) => {
								if (!active || !payload?.length) return null
								const entry = payload[0]
								const value = Number(entry.value)
								const percent = grandTotal > 0 ? ((value / grandTotal) * 100).toFixed(1) : '0.0'
								return (
									<div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-xs shadow-xl">
										<p className="font-semibold text-white">{entry.name}</p>
										<p className="mt-0.5 text-slate-300">{compactBRL(value)}</p>
										<p className="text-slate-500">{percent}% do total</p>
									</div>
								)
							}}
						/>
					</PieChart>
				</ResponsiveContainer>
				<div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
					<p className="text-[11px] uppercase tracking-[0.15em] text-slate-500">Total</p>
					<p className="mt-1 max-w-[120px] text-center text-sm font-semibold leading-tight text-white sm:text-base">
						{compactBRL(grandTotal)}
					</p>
				</div>
			</div>

			<div className="space-y-1.5">
				{data.slice(0, 7).map((entry) => {
					const percent = grandTotal > 0 ? ((entry.value / grandTotal) * 100).toFixed(1) : '0.0'
					return (
						<div key={entry.name} className="flex items-center gap-2 text-xs">
							<span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: entry.color }} />
							<span className="flex-1 truncate text-slate-300">{entry.name}</span>
							<span className="font-semibold text-white">{compactBRL(entry.value)}</span>
							<span className="w-11 text-right tabular-nums text-slate-500">{percent}%</span>
						</div>
					)
				})}
				{data.length > 7 && (
					<p className="pt-1 text-xs text-slate-500">+{data.length - 7} categorías más…</p>
				)}
			</div>
		</div>
	)
}

function SpendingPace({ series, currentDay }: { series: SpendPoint[]; currentDay: number }) {
	const actualTotal = series.length ? series[series.length - 1].actual : 0
	const idealTotal = series.length ? series[series.length - 1].ideal : 0
	const ahead = actualTotal > idealTotal

	return (
		<div>
			<div className="mb-4 flex flex-wrap items-center justify-between gap-2">
				<div className="flex flex-wrap gap-4 text-xs text-slate-400">
					<span className="flex items-center gap-1.5">
						<span className="h-2 w-2 rounded-full" style={{ backgroundColor: EMERALD }} /> Gasto real
					</span>
					<span className="flex items-center gap-1.5">
						<span className="inline-block w-4 border-t border-dashed border-slate-400" /> Presupuesto ideal
					</span>
				</div>
				<div
					className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${
						ahead ? 'border-rose-300/30 bg-rose-300/10 text-rose-300' : 'border-emerald-300/30 bg-emerald-300/10 text-emerald-300'
					}`}
				>
					{ahead ? 'Adelantado' : 'En ritmo'}
				</div>
			</div>

			<div className="h-[280px]">
				<ResponsiveContainer width="100%" height="100%">
					<AreaChart data={series} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
						<defs>
							<linearGradient id="gradActual" x1="0" y1="0" x2="0" y2="1">
								<stop offset="0%" stopColor={EMERALD} stopOpacity={0.35} />
								<stop offset="100%" stopColor={EMERALD} stopOpacity={0.02} />
							</linearGradient>
						</defs>
						<CartesianGrid stroke={GRID} vertical={false} />
						<XAxis
							dataKey="label"
							tick={{ fill: '#94a3b8', fontSize: 10 }}
							tickLine={false}
							axisLine={{ stroke: GRID }}
							interval="preserveStartEnd"
							minTickGap={28}
						/>
						<YAxis
							tick={{ fill: '#94a3b8', fontSize: 10 }}
							tickLine={false}
							axisLine={false}
							width={58}
							tickFormatter={(value) => formatToBRL_report(Number(value))}
						/>
						<Tooltip
							content={({ active, payload, label }) => {
								if (!active || !payload?.length) return null
								return (
									<div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-xs shadow-xl">
										<p className="font-semibold text-white">Día {payload[0].payload.day} · {label}</p>
										<p className="mt-1 text-slate-300">
											<span className="mr-1 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: EMERALD }} />
											Acumulado: <span className="font-semibold text-white">{compactBRL(Number(payload[0].value))}</span>
										</p>
										<p className="text-slate-400">
											<span className="mr-1 inline-block h-2 w-2 rounded-full bg-slate-500" />
											Ideal: <span className="font-semibold text-slate-200">{compactBRL(Number(payload[1]?.value ?? 0))}</span>
										</p>
									</div>
								)
							}}
						/>
						<ReferenceLine x={currentDay} stroke="#94a3b8" strokeDasharray="4 4" strokeOpacity={0.5} label={{ value: 'Hoy', fill: '#94a3b8', fontSize: 10, position: 'top' }} />
						<Area
							type="monotone"
							dataKey="actual"
							stroke={EMERALD}
							strokeWidth={2.5}
							fill="url(#gradActual)"
							dot={false}
							activeDot={{ r: 4, fill: EMERALD, stroke: '#0d1117' }}
						/>
						<Area type="monotone" dataKey="ideal" stroke="#94a3b8" strokeWidth={1.5} strokeDasharray="6 4" fill="none" dot={false} />
					</AreaChart>
				</ResponsiveContainer>
			</div>
		</div>
	)
}

function CashFlowBar({ money }: { money: ChartReportMoney }) {
	const data = [
		{ key: 'Entrada', label: 'Entrada', value: money.salary, color: EMERALD, sub: 'Salário do ciclo' },
		{ key: 'Gastos', label: 'Gastos', value: money.totalExpenses, color: ROSE, sub: 'Fixos + variáveis' },
		{ key: 'Disponível', label: 'Disponível', value: money.available, color: money.available < 0 ? ROSE : '#38bdf8', sub: 'Saldo restante' },
	]

	return (
		<div className="h-[280px]">
			<ResponsiveContainer width="100%" height="100%">
				<BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, left: 0, bottom: 0 }}>
					<CartesianGrid stroke={GRID} horizontal={false} />
					<XAxis
						type="number"
						tick={{ fill: '#94a3b8', fontSize: 10 }}
						tickLine={false}
						axisLine={false}
						tickFormatter={(value) => formatToBRL_report(Number(value))}
					/>
					<YAxis type="category" dataKey="label" width={76} tick={{ fill: '#cbd5e1', fontSize: 12 }} tickLine={false} axisLine={false} />
					<Tooltip
						cursor={{ fill: 'rgba(255,255,255,0.03)' }}
						content={({ active, payload }) => {
							if (!active || !payload?.length) return null
							const entry = payload[0].payload
							return (
								<div className="rounded-lg border border-white/10 bg-[#0d1117]/95 px-3 py-2 text-xs shadow-xl">
									<p className="font-semibold text-white">{entry.label}</p>
									<p className="mt-0.5 text-slate-300">{entry.sub}</p>
									<p className="mt-0.5 text-sm font-semibold" style={{ color: entry.color }}>
										{compactBRL(Number(entry.value))}
									</p>
								</div>
							)
						}}
					/>
					<ReferenceLine x={0} stroke={GRID} />
					<Bar dataKey="value" radius={[0, 6, 6, 0]} barSize={26} isAnimationActive={false}>
						{data.map((entry) => (
							<Cell key={entry.key} fill={entry.color} fillOpacity={0.9} />
						))}
					</Bar>
				</BarChart>
			</ResponsiveContainer>
		</div>
	)
}

function Insight({ status, label, value, helper }: { status: 'good' | 'warn' | 'danger' | 'neutral'; label: string; value: string; helper?: string }) {
	const styles = {
		good: { icon: <FiCheckCircle className="text-emerald-300" />, text: 'text-emerald-300', border: 'border-emerald-300/30 bg-emerald-300/10' },
		warn: { icon: <FiAlertTriangle className="text-amber-300" />, text: 'text-amber-300', border: 'border-amber-300/30 bg-amber-300/10' },
		danger: { icon: <FiAlertCircle className="text-rose-300" />, text: 'text-rose-300', border: 'border-rose-300/30 bg-rose-300/10' },
		neutral: { icon: <FiCheckCircle className="text-slate-400" />, text: 'text-slate-200', border: 'border-white/10 bg-white/[0.04]' },
	}[status]

	return (
		<div className={`rounded-lg border p-3 ${styles.border}`}>
			<div className="flex items-center gap-2">
				{styles.icon}
				<p className="text-[11px] uppercase tracking-[0.12em] text-slate-400">{label}</p>
			</div>
			<p className={`mt-2 text-lg font-semibold ${styles.text}`}>{value}</p>
			{helper && <p className="mt-1 text-[11px] leading-snug text-slate-500">{helper}</p>}
		</div>
	)
}

function AuditInsights({ period, money, fixedTransactions, variableTransactions, series }: {
	period: { start: string; end: string; totalDays: number }
	money: ChartReportMoney
	fixedTransactions: ChartTransaction[]
	variableTransactions: ChartTransaction[]
	series: SpendPoint[]
}) {
	const salary = money.salary
	const totalExpenses = money.totalExpenses

	if (salary <= 0) {
		return (
			<div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-8 text-center">
				<p className="text-sm text-slate-400">Configura el salario para habilitar la auditoría.</p>
			</div>
		)
	}

	const utilization = Math.min(100, Math.round((totalExpenses / salary) * 100))
	const fixedRatio = salary > 0 ? Math.round((money.fixedExpenses / salary) * 100) : 0
	const savingsRate = salary > 0 ? Math.round(((salary - totalExpenses) / salary) * 100) : 0
	const currentDay = getCurrentDayIndex(period, period.totalDays)
	const actualAtToday = series[currentDay]?.actual ?? 0
	const idealAtToday = series[currentDay]?.ideal ?? 0
	const paceRatio = idealAtToday > 0 ? Math.round((actualAtToday / idealAtToday) * 100) : 0
	const elapsedRatio = Math.round(((currentDay + 1) / period.totalDays) * 100)
	const avgDaily = totalExpenses / Math.max(1, currentDay + 1)

	const utilizationStatus: 'good' | 'warn' | 'danger' = utilization <= 70 ? 'good' : utilization <= 90 ? 'warn' : 'danger'
	const fixedStatus: 'good' | 'warn' | 'danger' = fixedRatio <= 50 ? 'good' : fixedRatio <= 65 ? 'warn' : 'danger'
	const paceStatus: 'good' | 'warn' | 'danger' = paceRatio <= 100 ? 'good' : paceRatio <= 115 ? 'warn' : 'danger'
	const savingsStatus: 'good' | 'warn' | 'danger' = savingsRate >= 20 ? 'good' : savingsRate >= 10 ? 'warn' : 'danger'
	const avgDailyStatus: 'good' | 'warn' | 'danger' = money.dailyLimit > 0 && avgDaily <= money.dailyLimit ? 'good' : 'warn'

	return (
		<div className="grid gap-3 sm:grid-cols-2">
			<Insight
				status={utilizationStatus}
				label="Uso del salario"
				value={`${utilization}%`}
				helper={`${compactBRL(totalExpenses)} de ${compactBRL(salary)} gastados en el ciclo.`}
			/>
			<Insight
				status={paceStatus}
				label="Ritmo de gasto"
				value={`${paceRatio}% del ideal`}
				helper={`Con ${elapsedRatio}% del ciclo transcurrido, llevas ${compactBRL(actualAtToday)} de ${compactBRL(idealAtToday)} previstos.`}
			/>
			<Insight
				status={fixedStatus}
				label="Costos fijos / salario"
				value={`${fixedRatio}%`}
				helper="Regla 50/30/20: idealmente menos del 50% en fijos."
			/>
			<Insight
				status={savingsStatus}
				label="Tasa de ahorro"
				value={`${savingsRate}%`}
				helper={`Saldo disponible: ${compactBRL(money.available)}.`}
			/>
			<Insight
				status={avgDailyStatus}
				label="Gasto promedio diario"
				value={compactBRL(avgDaily)}
				helper={`Límite diario sugerido: ${compactBRL(money.dailyLimit)}.`}
			/>
			<Insight
				status="neutral"
				label="Reserva de ocio"
				value={compactBRL(money.leisureAvailable)}
				helper={`Usado: ${compactBRL(money.leisureSpent)} de la reserva.`}
			/>
		</div>
	)
}

export function DashboardCharts({ period, money, fixedTransactions, variableTransactions }: DashboardChartsProps) {
	const salaryItems = [...fixedTransactions, ...variableTransactions]
	const series = buildSpendSeries(salaryItems, period, money.totalExpenses)
	const currentDay = getCurrentDayIndex(period, period.totalDays)

	return (
		<section className="mt-6 space-y-4">
			<div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
				<ChartCard>
					<SectionTitle
						icon={<FiPieChart size={16} />}
						title="Distribución de gastos por categoría"
						subtitle="Dónde se fue el dinero del ciclo, ordenado por participación."
					/>
					<SpendByCategory items={salaryItems} total={money.totalExpenses} />
				</ChartCard>

				<ChartCard>
					<SectionTitle
						icon={<FiTrendingUp size={16} />}
						title="Pacing: ritmo de gasto del ciclo"
						subtitle="Gasto acumulado real vs. presupuesto lineal ideal."
					/>
					<SpendingPace series={series} currentDay={currentDay} />
				</ChartCard>
			</div>

			<div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
				<ChartCard>
					<SectionTitle
						icon={<FiBarChart2 size={16} />}
						title="Balance de liquidez"
						subtitle="Ingreso total, costos operativos y margen disponible del ciclo."
					/>
					<CashFlowBar money={money} />
				</ChartCard>

				<ChartCard>
					<SectionTitle
						icon={<FiShield size={16} />}
						title="Auditoría financiera"
						subtitle="Indicadores calculados automáticamente sobre el período."
					/>
					<AuditInsights
						period={period}
						money={money}
						fixedTransactions={fixedTransactions}
						variableTransactions={variableTransactions}
						series={series}
					/>
				</ChartCard>
			</div>
		</section>
	)
}
