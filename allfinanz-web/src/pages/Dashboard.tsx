import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'
import { API } from '../services/api'
import { ListCard } from '../components/ListCard'
import { TableListTransaction } from '../components/TableListTransaction'

import { toast } from 'react-toastify'
import { SideBar } from '../components/SideBar'

export function Dashboard() {
	const [isLoading, setIsLoading] = useState<string>('')
	const [fixedTransactions, setFixedTransactions] = useState<any[]>([])
	const [relativeTransactions, setRelativeTransactions] = useState<any[]>([])
	const navigate = useNavigate()

	document.title = 'Allfinanz | Dashboard'

	useEffect(() => {
		loadTransactions()
	}, [])

	async function loadTransactions() {
		const userId = localStorage.getItem('iden')

		try {
			setIsLoading('blur-sm animate-pulse transition')
			const res = await API.get(`/transaction/list?user_id=${userId}`)
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

	return (
		<section className='flex w-5/6 mx-auto my-5'>
			<section className='w-1/4 mr-6'>
				<SideBar />
			</section>
			<section className='w-full mb-4 h-screen overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-brand-200 scrollbar-track-brand-600 hover:scrollbar-thumb-brand-100'>
				<div className={isLoading + " mx-8"}>
					<TableListTransaction title="Gastos Fixos" list={fixedTransactions} reload={loadTransactions} />
				</div>

				<div className={isLoading + " mx-8 my-4"}>
					<TableListTransaction title={"Gastos do mês"} list={relativeTransactions} reload={loadTransactions} />
				</div>
			</section>
		</section>
	)
}