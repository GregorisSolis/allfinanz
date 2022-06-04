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


export function Home(){

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
			navigate('/login')
		})	
	}

	return(
		<>
		<Navbar />
		<div className="w-full h-96 text-white flex">
			{ isAuthenticated() ? 
				<div className="w-4/5 m-auto p-4">
		
					<div className="my-4">
						<span className="text-2xl">Tarjetas</span>
						<ListCard />
					</div>

					<div className="my-4">
						<span className="text-2xl">Gastos Fijos</span>
						<div className="flex">
							<ListFixedCost list={listCostFixed} reload={() => loadTransaction()}/>
							<SidebarInfoUser 
								listCostFixed={listCostFixed}
								listCostMonth={listCostMonth}
							/>
						</div>
					</div>

					<div className="my-4">
						<span className="text-2xl">Transaciones del mes</span>
						<ListTransactions list={listCostMonth} reload={() => loadTransaction()}/>
					</div>

				</div>
			:
				<div>debes iniciar sesion</div>
			}
		</div>
		</>
	)
}