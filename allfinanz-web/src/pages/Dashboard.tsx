import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'
import { API } from '../services/api'
import { TableListTransaction } from '../components/TableListTransaction'
import { FiCalendar } from 'react-icons/fi'

import { toast } from 'react-toastify'
import { SideBar } from '../components/SideBar'
import { ChartReport, ChartReportProps } from '../components/ChartReport'
import { ButtonAddTransaction } from '../components/ButtonAddTransaction'
import { useUser } from '../contexts/UserContext'
import { TransactionTotals } from '../components/TransactionTotals'

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

export function Dashboard() {
	const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false)
	const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false)
	const [fixedTransactions, setFixedTransactions] = useState<any[]>([])
	const [relativeTransactions, setRelativeTransactions] = useState<any[]>([])
	const [report, setReport] = useState<ChartReportProps['list'] | null>(null)
	const [dateInit, setDateInit] = useState('')
	const [dateEnd, setDateEnd] = useState('')
	const [activeRange, setActiveRange] = useState<{ date_init: string; date_end: string } | null>(null)
	const navigate = useNavigate()

	const { user } = useUser();
 
	document.title = 'Allfinanz | Dashboard'

	useEffect(() => {
		loadTransactions();
		loadReport();
	}, [])

	useEffect(() => {
		if (!report?.period) return;
		if (activeRange) return;
		setDateInit(report.period.first_day_of_period || '');
		setDateEnd(report.period.last_day_of_period || '');
	}, [report, activeRange])

	async function loadTransactions(range?: { date_init: string; date_end: string }) {

		try {
			setIsLoadingTransactions(true)
			const res = await API.get('/transaction/list', { 
				withCredentials: true,
				params: range
			})
			const data = res.data.transactions

			// Validar que data.fixed e data.relatives são arrays
			if (data.fixed && Array.isArray(data.fixed)) {
				setFixedTransactions(data.fixed)
			} else {
				setFixedTransactions([])
			}

			if (data.relatives && Array.isArray(data.relatives)) {
				setRelativeTransactions(data.relatives)
			} else {
				setRelativeTransactions([])
			}

		} catch (error: any) {

			if(error.response.status == 401){
				toast.error('Usuario não autenticado.');
				logout()
				navigate('/')
			}else{
				toast.error('Erro ao carregar transações.');
				setFixedTransactions([])
				setRelativeTransactions([])
			}

		} finally {
			setIsLoadingTransactions(false)
		}
	}

	async function loadReport(range?: { date_init: string; date_end: string }) {

		try {
			setIsLoadingReport(true)
			const res = await API.get('/report', { 
				withCredentials: true,
				params: range
			});
			const data = res.data;

			setReport(data);

		} catch (error: any) {

			if(error.response.status == 401){
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
		loadTransactions(effectiveRange);
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
		updateView(range);
	}

	function handleClearDateRange() {
		setDateInit('');
		setDateEnd('');
		setActiveRange(null);
		updateView();
	}

	const isLoading = isLoadingTransactions || isLoadingReport

	return (
		<section className='flex w-5/6 mx-auto mt-0'>

			<ButtonAddTransaction />

			<section className='w-1/4 mr-6'>
				<SideBar />
			</section>
			<section className='w-full pb-28 h-screen overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-brand-200 scrollbar-track-brand-600 hover:scrollbar-thumb-brand-100'>

				<div className={isLoading ? "blur-sm animate-pulse transition" : "" + " mx-8"}>
					{report && <ChartReport list={report} />}
				</div>

				<section className={isLoading ? "blur-sm animate-pulse transition" : "" + " mx-8"}>
					<div className="flex flex-wrap gap-4 justify-between items-start mx-2 w-full">
						<span className="no-select p-3 bg-gray-200/10 w-full rounded-xl text-white mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
							<FiCalendar className="inline mr-1" />
							<span><strong>Período do relatório:</strong> {report?.period.first_day_of_period} até {report?.period.last_day_of_period}</span>
							<span className="text-gray-300">•</span>
							<span><strong>Dia do salário:</strong> {user?.salary_day}º</span>
							<span className="text-gray-300">•</span>
							<span><strong>Dias decorridos:</strong> {report?.period.today_day}</span>
							<span className="text-gray-300">•</span>
							<span><strong>Total de dias:</strong> {report?.period.total_days_in_period}</span>
						</span>
					</div>

					<div className="mx-2 mb-4 rounded-2xl border border-slate-700/60 bg-gradient-to-br from-slate-900/80 via-slate-900/40 to-slate-800/60 p-4 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.6)]">
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
							<div className="flex items-center gap-2">
								<button
									type="button"
									className="rounded-xl bg-sky-500/90 hover:bg-sky-400 text-slate-900 px-4 py-2 text-sm font-semibold transition shadow-[0_8px_20px_-12px_rgba(56,189,248,0.7)]"
									onClick={handleApplyDateRange}
								>
									Aplicar
								</button>
								<button
									type="button"
									className="rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 px-4 py-2 text-sm font-semibold transition border border-slate-700/80"
									onClick={handleClearDateRange}
								>
									Limpar
								</button>
							</div>
						</div>
					</div>
					
					<TransactionTotals />
				</section>
				
				<div className={isLoading ? "blur-sm animate-pulse transition" : "" + " mx-8"}>
					<TableListTransaction title="Gastos Fixos" list={fixedTransactions} reload={updateView} />
				</div>

				<div className={isLoading ? "blur-sm animate-pulse transition" : "" + " mx-8 my-4"}>
					<TableListTransaction title={"Gastos do mês"} list={relativeTransactions} reload={updateView} />
				</div>
			</section>
		</section>
	)
}
