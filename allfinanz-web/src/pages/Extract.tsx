import { FormEvent, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
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
	let searchDate = { month: parseInt(month), year: parseInt(year), day: 1 }
	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')
	const inputMonth = useRef<HTMLInputElement>(null)
	const inputYear = useRef<HTMLInputElement>(null)

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

	function setSearch(event: FormEvent) {
		event.preventDefault()
		if (parseInt(month) <= 0 || parseInt(month) > 12 || parseInt(year) < 0 || !month || !year) {
			setTextMessage('Fecha invalida.')
			setIsMessage(true)
		} else if (isNaN(parseInt(month)) || isNaN(parseInt(year)) || month.includes(',') || year.includes(',')) {
			setTextMessage('La fecha tiene que ser en numeros.')
			setIsMessage(true)
		} else {
			loadTransaction()
		}
	}

	const handleNextInput = (event: FormEvent<HTMLInputElement>) => {
		if (event.currentTarget.value.length === 2 && inputYear.current) {
			inputYear.current.focus();
		  }
	  };

	return (
		<>
			<div className="w-full text-white lg:flex md:block">

				<div className="lg:w-4/5 md:w-[90%] m-auto p-4">

					<form onSubmit={setSearch} className="lg:w-[63%] md:w-full flex justify-around items-center bg-brand-200 m-4 p-2 rounded">
						<input ref={inputMonth} maxLength={2} onInput={handleNextInput} className="w-[25%] m-1 text-center h-11 border-b-2 border-white bg-transparent hover:border-sky-500 focus:border-sky-500 outline-none" onChange={e => setMonth(e.target.value)} placeholder="Mes" />
						<input ref={inputYear} maxLength={4} className="w-[25%] m-1 text-center h-11 border-b-2 border-white bg-transparent hover:border-sky-500 focus:border-sky-500 outline-none" onChange={e => setYear(e.target.value)} placeholder="Año" />
						<div className="">
							<button type='submit' className="bg-sky-600 hover:bg-sky-500 rounded px-4 py-2 text-xl">Buscar</button>
						</div>
					</form>

					<div className="my-4">
						<span className="text-2xl">Gastos del mes</span>

					</div>

					<div className="my-4 mb-16">
						<span className="text-2xl">Tarjetas</span>
					</div>

				</div>
			</div>
		</>
	)
}