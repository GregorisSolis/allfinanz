import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'
import { API } from '../services/api'
import { FiCalendar, FiRefreshCw } from 'react-icons/fi'

import { toast } from 'react-toastify'
import { ChartReport, ChartReportProps } from '../components/ChartReport'
import { DashboardCharts } from '../components/DashboardCharts'
import { ChartTransaction } from '../services/chartData'
import { ButtonAddTransaction } from '../components/ButtonAddTransaction'
import { useUser } from '../contexts/UserContext'

function DateField({
	id,
	label,
	value,
	onChange
}: {
	id: string;
	label: string;
	value: string;
	onChange: (value: string) => void;
}) {
	return (
		<div className="flex flex-col gap-2 min-w-[190px]">
			<label className="text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor={id}>
				{label}
			</label>
			<div className="relative">
				<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
					<FiCalendar size={16} />
				</div>
				<input
					id={id}
					type="date"
					className="w-full rounded-lg bg-transparent pl-10 pr-3 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition placeholder-white"
					value={value}
					onChange={(e) => onChange(e.target.value)}
				/>
			</div>
		</div>
	);
}

function formatDateInput(date: Date) {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, '0');
	const day = String(date.getDate()).padStart(2, '0');

	return `${year}-${month}-${day}`;
}

function getSalaryCycleRange(offset: number, salaryDay: number) {
	const now = new Date();
	const currentCycleStartsThisMonth = now.getDate() >= salaryDay;
	const cycleStartMonthOffset = currentCycleStartsThisMonth ? 0 : -1;
	const startAnchor = new Date(now.getFullYear(), now.getMonth() + cycleStartMonthOffset + offset, salaryDay);
	const endAnchor = new Date(now.getFullYear(), now.getMonth() + cycleStartMonthOffset + offset + 1, salaryDay - 1);

	return {
		date_init: formatDateInput(startAnchor),
		date_end: formatDateInput(endAnchor),
	};
}

// O backend armazena os valores em centavos; os gráficos trabalham em reais
function toReais(item: ChartTransaction): ChartTransaction {
	return { ...item, amount: (Number(item.amount) || 0) / 100 };
}

export function Dashboard() {
	const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false)
	const [report, setReport] = useState<ChartReportProps['list'] | null>(null)
	const [fixedTransactions, setFixedTransactions] = useState<ChartTransaction[]>([])
	const [variableTransactions, setVariableTransactions] = useState<ChartTransaction[]>([])
	const [dateInit, setDateInit] = useState('')
	const [dateEnd, setDateEnd] = useState('')
	const [activeRange, setActiveRange] = useState<{ date_init: string; date_end: string } | null>(null)
	const [activeShortcut, setActiveShortcut] = useState<'previous' | 'current' | 'next' | null>(null)
	const navigate = useNavigate()

	const { user } = useUser();
 
	document.title = 'Allfinanz | Dashboard'

	useEffect(() => {
		loadReport();
	}, [])

	useEffect(() => {
		if (!report?.period) return;
		if (activeRange) return;
		setDateInit(report.period.start || '');
		setDateEnd(report.period.end || '');
	}, [report, activeRange])

	async function loadReport(range?: { date_init: string; date_end: string }) {

		try {
			setIsLoadingReport(true)
			const [summaryRes, statementRes] = await Promise.all([
				API.get('/report/summary', {
					withCredentials: true,
					params: range
				}),
				API.get('/transaction/list', {
					withCredentials: true,
					params: range
				}),
			]);

			setReport(summaryRes.data);

			const statement = statementRes.data.statement;
			if (statement) {
				setFixedTransactions((statement.fixedExpenses?.items || []).map(toReais));
				setVariableTransactions((statement.variableExpenses?.items || []).map(toReais));
			} else {
				setFixedTransactions((statementRes.data.transactions?.fixed || []).map(toReais));
				setVariableTransactions((statementRes.data.transactions?.relatives || []).map(toReais));
			}

		} catch (error: any) {

			if(error.response?.status == 401){
				toast.error('Usuario não autenticado.');
				logout()
				navigate('/')
			}else{
				toast.error('Erro ao carregar o report.');
			}

		} finally {
			setIsLoadingReport(false)
		}
	}

	function updateView(range?: { date_init: string; date_end: string }){
		const effectiveRange = range ?? activeRange ?? undefined;
		loadReport(effectiveRange);
	}

	function handleApplyDateRange() {
		if (!dateInit || !dateEnd) {
			toast.error('Selecione as duas datas para filtrar.');
			return;
		}
		if (dateInit > dateEnd) {
			toast.error('A data inicial não pode ser maior que a data final.');
			return;
		}
		const range = { date_init: dateInit, date_end: dateEnd };
		setActiveRange(range);
		setActiveShortcut(null);
		updateView(range);
	}

	function handleClearDateRange() {
		setDateInit('');
		setDateEnd('');
		setActiveRange(null);
		setActiveShortcut(null);
		loadReport();
	}

	function handleMonthShortcut(offset: number) {
		if (!user?.salary_day) {
			toast.error('Dia do salário não configurado.');
			return;
		}
		const range = getSalaryCycleRange(offset, user.salary_day);
		const shortcut = offset === -1 ? 'previous' : offset === 0 ? 'current' : 'next';
		setDateInit(range.date_init);
		setDateEnd(range.date_end);
		setActiveRange(range);
		setActiveShortcut(shortcut);
		updateView(range);
	}

	const isLoading = isLoadingReport
	const shortcutButtonClassName = "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60"
	const shortcutSelectedClassName = "border-emerald-300/50 text-emerald-200"
	const activeShortcutLabel = activeShortcut === 'previous'
		? 'Mês passado'
		: activeShortcut === 'current'
			? 'Mês atual'
			: activeShortcut === 'next'
				? 'Próximo mês'
				: 'Nenhum'

	return (
		<section className='text-slate-100 pb-24'>
			<ButtonAddTransaction />

			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
				<div>
					<p className="text-sm font-medium text-slate-400">Dashboard</p>
					<h1 className="mt-1 text-2xl font-semibold text-white">Controle financeiro</h1>
					<p className="mt-2 text-sm text-slate-400">
						Acompanhe o dinheiro disponível, gastos do período e limite diário.
					</p>
				</div>

				<button
					type="button"
					className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
					onClick={() => updateView()}
					disabled={isLoading}
				>
					<FiRefreshCw className={isLoading ? "animate-spin" : ""} />
					Atualizar
				</button>
			</div>

			<div className={isLoading ? "animate-pulse transition" : ""}>
				{report && (
					<>
						<ChartReport list={report} />
						<DashboardCharts
							period={{ ...report.period, totalDays: report.period.totalDays || 1 }}
							money={report.money}
							fixedTransactions={fixedTransactions}
							variableTransactions={variableTransactions}
						/>
					</>
				)}
				{!report && (
					<div className="rounded-lg border border-white/10 bg-[#0d1117] p-8 text-center text-slate-400">
						{isLoading ? 'Carregando relatório...' : 'Nenhum relatório disponível.'}
					</div>
				)}
			</div>

			<section className={(isLoading ? "animate-pulse transition " : "") + "mt-4 space-y-4"}>
				<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-200">
					<div className="flex items-center gap-2 text-sm font-semibold text-white">
						<FiCalendar className="text-slate-400" />
						Período do relatório
					</div>
					<div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
						<div>
							<p className="text-xs uppercase text-slate-500">Intervalo</p>
							<p className="mt-1 font-medium">{report?.period.start || '--'} até {report?.period.end || '--'}</p>
						</div>
						<div>
							<p className="text-xs uppercase text-slate-500">Dia do salário</p>
							<p className="mt-1 font-medium">{user?.salary_day ? `${user.salary_day}º` : '--'}</p>
						</div>
						<div>
							<p className="text-xs uppercase text-slate-500">Dias decorridos</p>
							<p className="mt-1 font-medium">{report?.period.currentDay ?? '--'}</p>
						</div>
						<div>
							<p className="text-xs uppercase text-slate-500">Total de dias</p>
							<p className="mt-1 font-medium">{report?.period.totalDays ?? '--'}</p>
						</div>
					</div>
				</div>

				<div className="rounded-lg border border-white/10 bg-[#0d1117] p-4 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
					<div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
						<div>
							<p className="text-sm font-semibold text-white">Filtrar relatório</p>
							<p className="mt-1 text-sm text-slate-400">Escolha um intervalo fechado para recalcular os indicadores.</p>
							<p className="mt-2 text-xs uppercase tracking-[0.2em] text-slate-500">Selecionado: {activeShortcutLabel}</p>
						</div>
					</div>
					<div className="flex flex-wrap items-end gap-3">
						<DateField
							id="dateInit"
							label="Data inicial"
							value={dateInit}
							onChange={setDateInit}
						/>
						<DateField
							id="dateEnd"
							label="Data final"
							value={dateEnd}
							onChange={setDateEnd}
						/>
						<div className="flex flex-wrap items-center gap-2">
							<button
								type="button"
								aria-pressed={activeShortcut === 'previous'}
								className={`${shortcutButtonClassName} ${activeShortcut === 'previous' ? shortcutSelectedClassName : ''}`}
								onClick={() => handleMonthShortcut(-1)}
								disabled={isLoading}
							>
								Mês passado
							</button>
							<button
								type="button"
								aria-pressed={activeShortcut === 'current'}
								className={`${shortcutButtonClassName} ${activeShortcut === 'current' ? shortcutSelectedClassName : ''}`}
								onClick={() => handleMonthShortcut(0)}
								disabled={isLoading}
							>
								Mês atual
							</button>
							<button
								type="button"
								aria-pressed={activeShortcut === 'next'}
								className={`${shortcutButtonClassName} ${activeShortcut === 'next' ? shortcutSelectedClassName : ''}`}
								onClick={() => handleMonthShortcut(1)}
								disabled={isLoading}
							>
								Próximo mês
							</button>
							<button
								type="button"
								className="rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60"
								onClick={handleApplyDateRange}
								disabled={isLoading}
							>
								Aplicar
							</button>
							<button
								type="button"
								className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60"
								onClick={handleClearDateRange}
								disabled={isLoading}
							>
								Limpar
							</button>
						</div>
					</div>
				</div>
			</section>
		</section>
	)
}
