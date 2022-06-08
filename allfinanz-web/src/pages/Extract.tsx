import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ListCard } from '../components/ListCard'
import { ListTransactions } from '../components/ListTransactions'
import { SidebarInfoUser } from '../components/SidebarInfoUser'
import { Navbar } from '../components/Navbar'
import { API } from '../services/api'


export function Extract() {

	useEffect(() => {
		loadTransaction()
	}, [])

	document.title = 'Allfinanz - Extracto'
	let [listCostMonth, setListCostMonth] = useState([])
	let [listCostFixed, setListCostFixed] = useState([])
	let navigate = useNavigate()
	let [month, setMonth] = useState('')
	let [year, setYear] = useState('')
	let searchDate = { month: parseInt(month),year: parseInt(year) }

	async function loadTransaction() {

		const ID_USER = localStorage.getItem('iden')

		await API.get(`/operation/all-transaction/user/${ID_USER}`)
			.then(res => {
				let items = res.data.transactions
				let listAA:any = []
				let listBB:any = []
				items.map((trans: any) => {
					if (trans.category === 'GastoFijo') {
						listAA.push(trans)
					} else if (trans.date.month === parseInt(month) && trans.date.year === parseInt(year)) {
						listBB.push(trans)
					}
				})
				setListCostFixed(listAA)
				setListCostMonth(listBB)
			})
			.catch(() => {
				navigate('/login')
			})
	}

	function setSearch(event: FormEvent){
		event.preventDefault()
		loadTransaction()
	}

	return (
		<>
			<Navbar location='extract'/>
			<div className="w-full h-96 text-white flex">
				<div className="w-4/5 m-auto p-4">

					<form onSubmit={setSearch} className="flex bg-brand-200 rounded p-2">
						<input className="transition w-1/4 m-auto p-1  text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none" onChange={e => setMonth(e.target.value)} placeholder="Mes" />
						<input className="transition w-1/4 m-auto p-1  text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none" onChange={e => setYear(e.target.value)} placeholder="Año" />
						<div className="flex justify-center items-center m-4">
							<button type='submit' className="bg-sky-600 hover:bg-sky-500 rounded px-4 py-2 text-xl">Buscar</button>
						</div>
					</form>

					<div className="my-4">
						<span className="text-2xl">Gastos del mes</span>
						<div className="flex">
							<ListTransactions list={listCostMonth} reload={() => loadTransaction()}/>
							<SidebarInfoUser
								listCostFixed={listCostFixed}
								listCostMonth={listCostMonth}
							/>
						</div>
					</div>

					<div className="my-4">
						<span className="text-2xl">Tarjetas</span>
						<ListCard 
							listCostFixed={listCostFixed}
							listCostMonth={listCostMonth}
							date={searchDate}
						/>
					</div>

				</div>
			</div>
		</>
	)
}