import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CalendarContent } from '../components/CalendarContent'
import { ListCard } from '../components/ListCard'
import { ListTransactions } from '../components/ListTransactions'
import { SidebarInfoUser } from '../components/SidebarInfoUser'
import { Navbar } from '../components/Navbar'
import { date_now } from '../services/dateCreate'
import { API } from '../services/api'


export function Extract(){

	useEffect(() => {
		loadTransaction()
	},[])

	document.title = 'Allfinanz'
	let [listCostMonth, setListCostMonth] = useState([])
	let [listCostFixed, setListCostFixed] = useState([])
	let navigate = useNavigate()
	let date = date_now()

	async function loadTransaction(){
		const ID_USER = localStorage.getItem('iden')

		await API.get(`/operation/all-transaction/user/${ID_USER}`)
		.then(res => {
			let items = res.data.transactions
			let listAA = []
			let listBB = []
			items.map((trans: any) => {
				if(trans.category === 'GastoFijo'){
					listAA.push(trans)
				}else if(trans.date.month === date.month && trans.date.year === date.year){
					listBB.push(trans)
				}
			})
			setListCostFixed(listAA)
			setListCostMonth(listBB)
		})
		.catch(err => {
			//navigate('/login')
		})	
	}

	return(
		<>
		<Navbar />
		<div className="w-full h-96 text-white flex">
			<div className="w-4/5 m-auto p-4">

				<div className="flex">
					<CalendarContent />
				</div>

				<div className="my-4">
					<span className="text-2xl">Gastos del mes</span>
					<div className="flex">
						<ListTransactions list={listCostMonth} />
						<SidebarInfoUser 
							listCostFixed={listCostFixed}
							listCostMonth={listCostMonth}
						/>
					</div>
				</div>

				<div className="my-4">
					<span className="text-2xl">Tarjetas</span>
					<ListCard />
				</div>

			</div>
		</div>
		</>
	)
}