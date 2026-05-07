import { FormEvent, useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { TableListTransaction } from '../components/TableListTransaction'
import { toast } from 'react-toastify'
import { categoryOptions } from '../services/categoryOptions'
import { FiSearch } from 'react-icons/fi'


export function Extract() {

	useEffect(() => {
		loadTransaction()
	}, [])

	document.title = 'Allfinanz | Extracto'
	let navigate = useNavigate()
	let [transactions, setTransaction] = useState<any[]>([])
	let [cards, setCards] = useState<any[]>([])
	let [startDate, setStartDate] = useState('')
	let [endDate, setEndDate] = useState('')
	let [category, setCategory] = useState('')
	let [card, setCard] = useState('')
	let [description, setDescription] = useState('')

	async function loadTransaction() {

		await API.get(`/transaction/list`, {withCredentials: true})
			.then(res => {
				setTransaction(res.data.transactions.relatives);
			})
			.catch(() => {
				navigate('/login')
			})
	}

	async function loadCards() {
		try {
			const resp = await API.get('/card/all-card/user', { withCredentials: true })
			setCards(resp.data.cards || [])
		} catch (err) {
			setCards([])
		}
	}

	async function setSearch(event: FormEvent) {
		event.preventDefault()
		if (startDate && endDate && startDate > endDate) {
			toast.warning('A data inicial não pode ser maior que a data final.')
			return
		}

		const params: Record<string, string> = {}
		if (startDate) params.date_init = startDate
		if (endDate) params.date_end = endDate
		if (category) params.category = category
		if (card) params.card = card
		if (description.trim()) params.description = description.trim()

		if (Object.keys(params).length === 0) {
			loadTransaction()
			return
		}

		try {
			const res = await API.get('/transaction/search', { withCredentials: true, params })
			setTransaction(res.data.transactions || [])
		} catch (err) {
			toast.error('Erro ao buscar transações.')
		}
	}

	useEffect(() => {
		loadCards()
	}, [])


	return (
		<>
			<div className="w-full pb-28 h-screen overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-brand-200 scrollbar-track-brand-600 hover:scrollbar-thumb-brand-100">

				<div className="lg:w-4/5 md:w-[90%] m-auto p-4">

					<form onSubmit={setSearch} className="w-full bg-slate-800 m-2 rounded-xl p-6 shadow-lg flex flex-col gap-6">
						<div className="w-full flex flex-col md:flex-row gap-4">
							<div className="flex-1 flex flex-col">
								<label className="text-lg text-gray-200 font-medium" htmlFor="startDate">Data Início</label>
								<input id="startDate" type="date" className="rounded bg-transparent px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2 text-gray-200 focus:border-sky-500 transition" onChange={e => setStartDate(e.target.value)} value={startDate} />
							</div>
							<div className="flex-1 flex flex-col">
								<label className="text-lg text-gray-200 font-medium" htmlFor="endDate">Data Fim</label>
								<input id="endDate" type="date" className="rounded bg-transparent px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2 text-gray-200 focus:border-sky-500 transition" onChange={e => setEndDate(e.target.value)} value={endDate} />
							</div>
							<div className="flex-1 flex flex-col">
								<label className="text-lg text-gray-200 font-medium" htmlFor="description">Descrição</label>
								<input id="description" type="text" placeholder="Exemplo: Mercado do mês..." className="rounded bg-transparent px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2 text-gray-200 focus:border-sky-500 transition" onChange={e => setDescription(e.target.value)} value={description} autoComplete="off" />
							</div>
						</div>
						<div className="w-full flex flex-col md:flex-row gap-4">
							<div className="flex-1 flex flex-col">
								<label className="text-lg text-gray-200 font-medium" htmlFor="category">Categoria</label>
								<select id="category" className="rounded bg-slate-900 px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2 text-gray-200 focus:border-sky-500 transition" onChange={e => setCategory(e.target.value)} value={category}>
									<option value="">Selecione</option>
									{categoryOptions.map(option => (
										<option key={option._id} value={option._id}>{option.name}</option>
									))}
								</select>
							</div>
							<div className="flex-1 flex flex-col">
								<label className="text-lg text-gray-200 font-medium" htmlFor="card">Cartão</label>
								<select
									id="card"
									className="rounded bg-slate-900 px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2 text-gray-200 focus:border-sky-500 transition"
									onChange={e => setCard(e.target.value)}
									value={card}
									disabled={cards.length === 0}
								>
									{cards.length > 0 ? (
										<>
											<option value="">Selecione</option>
											{cards.map((c) => (
												<option key={c._id} value={c._id}>{c.name}</option>
											))}
										</>
									) : (
										<option value="">Nenhum cartão cadastrado</option>
									)}
								</select>
							</div>
						</div>
						<div className="flex justify-center mt-2">
							<button 
								type='submit' 
								className="inline-flex text-white items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 transform hover:scale-105 shadow-lg"
							>
								<FiSearch />
								Buscar
							</button>
						</div>
					</form>

					<TableListTransaction
						list={transactions}
						title='Extrato'
						reload={loadTransaction}
					/>

				</div>
			</div>
		</>
	)
}
