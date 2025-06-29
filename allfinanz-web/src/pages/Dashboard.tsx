import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'
import { API } from '../services/api'
import { TableListTransaction } from '../components/TableListTransaction'

import { toast } from 'react-toastify'
import { SideBar } from '../components/SideBar'
import { ChartReport, ChartReportProps } from '../components/ChartReport'
import { formatToBRL, formatToBRL_report } from '../services/amountFormat'

export function Dashboard() {
	const [isLoading, setIsLoading] = useState<string>('')
	const [fixedTransactions, setFixedTransactions] = useState<any[]>([])
	const [relativeTransactions, setRelativeTransactions] = useState<any[]>([])
	const [report, setReport] = useState<ChartReportProps['list'] | null>(null)
	const navigate = useNavigate()

	document.title = 'Allfinanz | Dashboard'

	useEffect(() => {
		loadTransactions();
		loadReport();
	}, [])

	async function loadTransactions() {

		try {
			setIsLoading('blur-sm animate-pulse transition')
			const res = await API.get('/transaction/list', { withCredentials: true })
			const data = res.data.transactions

			// Asegurarse de que data.fixed es un array
			if (data.fixed && Array.isArray(data.fixed)) {
				setFixedTransactions(data.fixed)
				setRelativeTransactions(data.relatives)
			} else {
				setFixedTransactions([])
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
			setIsLoading('')
		}
	}

	async function loadReport() {
		const userId = localStorage.getItem('iden')

		try {
			setIsLoading('blur-sm animate-pulse transition')
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
			setIsLoading('')
		}
	}

	function updateView(){
		loadTransactions();
		loadReport();
	}

	return (
		<section className='flex w-5/6 mx-auto mt-0'>
			<section className='w-1/4 mr-6'>
				<SideBar />
			</section>
			<section className='w-full pb-28 h-screen overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-brand-200 scrollbar-track-brand-600 hover:scrollbar-thumb-brand-100'>

				<div className={isLoading + " mx-8"}>
					{report && <ChartReport list={report} />}
				</div>
				
				<div className={isLoading + " mx-8"}>
					<TableListTransaction title="Gastos Fixos" list={fixedTransactions} reload={updateView} />
				</div>

				<div className={isLoading + " mx-8 my-4"}>
					<TableListTransaction title={"Gastos do mês"} list={relativeTransactions} reload={updateView} />
				</div>
			</section>
		</section>
	)
}