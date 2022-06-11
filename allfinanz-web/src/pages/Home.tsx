import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { isAuthenticated } from '../services/auth'
import { API } from '../services/api'
import { date_now } from '../services/dateCreate'
import { Navbar } from '../components/Navbar'
import { ListCard } from '../components/ListCard'
import { ListFixedCost } from '../components/ListFixedCost'
import { ListTransactions } from '../components/ListTransactions'
import { SidebarInfoUser } from '../components/SidebarInfoUser'
import { IsNotUser } from '../components/IsNotUser'


export function Home() {

	useEffect(() => {
		loadTransaction()
	}, [])

	document.title = 'Allfinanz'
	let [listCostMonth, setListCostMonth] = useState([])
	let [listCostFixed, setListCostFixed] = useState([])
	let navigate = useNavigate()
	let date = date_now()

	async function loadTransaction() {
		const ID_USER = localStorage.getItem('iden')

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
				navigate('/')
			})
	}

	return (
		<>
			<Navbar location='home' />
			{isAuthenticated() ?
				<div className="w-full h-96 text-white lg:flex md:block">
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
							<span className="text-2xl">Gastos Fijos</span>
							<div className="lg:flex md:block">
								<ListFixedCost list={listCostFixed} reload={() => loadTransaction()} />
								<SidebarInfoUser
									listCostFixed={listCostFixed}
									listCostMonth={listCostMonth}
								/>
							</div>
						</div>

						<div className="my-4">
							<span className="text-2xl">Transaciones del mes</span>
							<ListTransactions list={listCostMonth} reload={() => loadTransaction()} />
						</div>

					</div>
				</div>
				:
				<IsNotUser />
			}
		</>
	)
}