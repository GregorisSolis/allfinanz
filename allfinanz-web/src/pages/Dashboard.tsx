import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { logout } from '../services/auth'
import { API } from '../services/api'
import { date_now } from '../services/dateCreate'
import { Navbar } from '../components/Navbar'
import { ListCard } from '../components/ListCard'
import { ListFixedCost } from '../components/ListFixedCost'
import { ListTransactions } from '../components/ListTransactions'
import { SidebarInfoUser } from '../components/SidebarInfoUser'


export function Dashboard() {

	useEffect(() => {
		loadTransaction()
	}, [])

	document.title = 'Allfinanz - Dashboard'
	let [listCostMonth, setListCostMonth] = useState([])
	let [listCostFixed, setListCostFixed] = useState([])
	let [isLoading, setIsLoading] = useState('')
	let navigate = useNavigate()
	let date = date_now()

	async function loadTransaction() {
		const ID_USER = localStorage.getItem('iden')

		setIsLoading('blur-sm animate-pulse transition');
		await API.get(`/operation/all-transaction/user/${ID_USER}`)
		.then(res => {
				let items = res.data.transactions
				let listAA: any = []
				let listBB: any = []
				items.map((trans: any) => {
					if (trans.category === 'GastoFijo') {
						listAA.push(trans)
					} else if (trans.date.month === date.month && trans.date.year === date.year) {
						listBB.push(trans)
					}
				})
				setListCostFixed(listAA)
				setListCostMonth(listBB)
			})
			.catch(() => {
				logout();
				navigate('/');
			})
		setIsLoading('');
	}

	return (
		<>
			<Navbar location='Dashboard' />
				<div className={`w-full h-96 text-white lg:flex md:block ` + isLoading}>
					<div className="md:w-[90%] lg:w-4/5 m-auto p-4">

						<div className="my-4">
							<span className="text-2xl">Tarjetas</span>
							<ListCard
								listCostFixed={listCostFixed}
								listCostMonth={listCostMonth}
								date={date}
							/>
						</div>

						<div className="lg:my-4 md:my-0">
							<span className="text-2xl">Transaciones del mes</span>
							<div className="lg:flex md:block">
								<ListTransactions list={listCostMonth} reload={() => loadTransaction()} />
								<SidebarInfoUser
										listCostFixed={listCostFixed}
										listCostMonth={listCostMonth}
								/>
							</div>

						</div>

						<div className="my-4 mb-16">
							<span className="text-2xl">Gastos Fijos</span>
							<ListFixedCost list={listCostFixed} reload={() => loadTransaction()} />
						</div>

					</div>
				</div>
		</>
	)
}