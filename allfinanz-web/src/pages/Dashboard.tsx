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

export function Dashboard() {
	const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false)
	const [isLoadingReport, setIsLoadingReport] = useState<boolean>(false)
	const [fixedTransactions, setFixedTransactions] = useState<any[]>([])
	const [relativeTransactions, setRelativeTransactions] = useState<any[]>([])
	const [report, setReport] = useState<ChartReportProps['list'] | null>(null)
	const navigate = useNavigate()

	const { user } = useUser();
 
	document.title = 'Allfinanz | Dashboard'

	useEffect(() => {
		loadTransactions();
		loadReport();
	}, [])

	async function loadTransactions() {

		try {
			setIsLoadingTransactions(true)
			const res = await API.get('/transaction/list', { withCredentials: true })
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

	async function loadReport() {

		try {
			setIsLoadingReport(true)
			const res = await API.get('/report', { withCredentials: true });
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

	function updateView(){
		loadTransactions();
		loadReport();
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
							<span><strong>Dias decorridos:</strong> {report?.period.days_in_period}</span>
							<span className="text-gray-300">•</span>
							<span><strong>Total de dias:</strong> {report?.period.total_days_in_period}</span>
						</span>
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