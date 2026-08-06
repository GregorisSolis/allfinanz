import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { TableListTransaction } from '../components/TableListTransaction'
import { toast } from 'react-toastify'
import { categoryOptions } from '../services/categoryOptions'
import { FiSearch, FiX } from 'react-icons/fi'
import { formatToBRL } from '../services/amountFormat'
import { useUser } from '../contexts/UserContext'
import { ButtonAddTransaction } from '../components/ButtonAddTransaction'

interface TransactionItem {
	_id: string
	amount: number
	description: string
	category: number
	type: number
	fixed?: boolean
	card?: string
}

function formatDateInput(date: Date) {
	const year = date.getFullYear()
	const month = String(date.getMonth() + 1).padStart(2, '0')
	const day = String(date.getDate()).padStart(2, '0')

	return `${year}-${month}-${day}`
}

function getSalaryCycleRange(offset: number, salaryDay: number) {
	const now = new Date()
	const currentCycleStartsThisMonth = now.getDate() >= salaryDay
	const cycleStartMonthOffset = currentCycleStartsThisMonth ? 0 : -1
	const startAnchor = new Date(now.getFullYear(), now.getMonth() + cycleStartMonthOffset + offset, salaryDay)
	const endAnchor = new Date(now.getFullYear(), now.getMonth() + cycleStartMonthOffset + offset + 1, salaryDay - 1)

	return {
		date_init: formatDateInput(startAnchor),
		date_end: formatDateInput(endAnchor),
	}
}


export function Extract() {

	useEffect(() => {
		loadTransaction()
	}, [])

	document.title = 'Allfinanz | Extracto'
	let navigate = useNavigate()
	const { user } = useUser()
	let [fixedTransactions, setFixedTransactions] = useState<TransactionItem[]>([])
	let [variableTransactions, setVariableTransactions] = useState<TransactionItem[]>([])
	let [cards, setCards] = useState<any[]>([])
	let [startDate, setStartDate] = useState('')
	let [endDate, setEndDate] = useState('')
	let [category, setCategory] = useState('')
	let [card, setCard] = useState('')
	let [description, setDescription] = useState('')
	let [activeShortcut, setActiveShortcut] = useState<'previous' | 'current' | 'next' | null>(null)

	const shortcutButtonClassName = "rounded-lg border border-white/10 bg-white/[0.04] px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
	const shortcutSelectedClassName = "border-emerald-300/50 text-emerald-200"

	function splitTransactions(items: TransactionItem[]) {
		setFixedTransactions(items.filter(item => item.fixed === true))
		setVariableTransactions(items.filter(item => item.fixed !== true))
	}

	function getTotal(items: TransactionItem[]) {
		return items.reduce((total, item) => total + (item.amount || 0), 0)
	}

	function clearFilters() {
		setStartDate('')
		setEndDate('')
		setCategory('')
		setCard('')
		setDescription('')
		setActiveShortcut(null)
		loadTransaction()
	}

	function handleShortcut(offset: number) {
		if (!user?.salary_day) {
			toast.error('Dia do salário não configurado.')
			return
		}

		const range = getSalaryCycleRange(offset, user.salary_day)
		const shortcut = offset === -1 ? 'previous' : offset === 0 ? 'current' : 'next'
		setStartDate(range.date_init)
		setEndDate(range.date_end)
		setActiveShortcut(shortcut)
		loadTransaction(range)
	}

	async function loadTransaction(range?: { date_init: string; date_end: string }) {

		await API.get(`/transaction/list`, {withCredentials: true, params: range})
			.then(res => {
				const statement = res.data.statement

				if (statement) {
					setFixedTransactions(statement.fixedExpenses?.items || [])
					setVariableTransactions(statement.variableExpenses?.items || [])
					return
				}

				setFixedTransactions(res.data.transactions.fixed || [])
				setVariableTransactions(res.data.transactions.relatives || [])
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
		setActiveShortcut(null)

		if (Object.keys(params).length === 0) {
			loadTransaction()
			return
		}

		try {
			const res = await API.get('/transaction/search', { withCredentials: true, params })
			splitTransactions(res.data.transactions || [])
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

				<div className="w-full p-4">
					<ButtonAddTransaction />

					<form onSubmit={setSearch} className="w-full rounded-lg border border-white/10 bg-[#0d1117] p-4 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
						<div className="flex flex-col gap-1 mb-5">
							<h2 className="text-sm font-semibold text-white">Filtros</h2>
							<p className="text-sm text-slate-400">Refine o extrato por período, descrição, categoria ou cartão.</p>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
							<div className="xl:col-span-2 flex flex-col">
								<label className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-2" htmlFor="startDate">Data início</label>
								<input id="startDate" type="date" className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition" onChange={e => setStartDate(e.target.value)} value={startDate} />
							</div>
							<div className="xl:col-span-2 flex flex-col">
								<label className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-2" htmlFor="endDate">Data fim</label>
								<input id="endDate" type="date" className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition" onChange={e => setEndDate(e.target.value)} value={endDate} />
							</div>
							<div className="md:col-span-2 xl:col-span-4 flex flex-col">
								<label className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-2" htmlFor="description">Descrição</label>
								<input id="description" type="text" placeholder="Exemplo: Mercado do mês..." className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition placeholder:text-slate-500" onChange={e => setDescription(e.target.value)} value={description} autoComplete="off" />
							</div>
							<div className="xl:col-span-2 flex flex-col">
								<label className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-2" htmlFor="category">Categoria</label>
								<select id="category" className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition" onChange={e => setCategory(e.target.value)} value={category}>
									<option value="">Selecione</option>
									{categoryOptions.map(option => (
										<option key={option._id} value={option._id}>{option.name}</option>
									))}
								</select>
							</div>
							<div className="xl:col-span-2 flex flex-col">
								<label className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-2" htmlFor="card">Cartão</label>
								<select
									id="card"
									className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition"
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

						<div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
							<div className="flex flex-wrap items-center gap-2">
								<button
									type="button"
									aria-pressed={activeShortcut === 'previous'}
									className={`${shortcutButtonClassName} ${activeShortcut === 'previous' ? shortcutSelectedClassName : ''}`}
									onClick={() => handleShortcut(-1)}
								>
									Mês passado
								</button>
								<button
									type="button"
									aria-pressed={activeShortcut === 'current'}
									className={`${shortcutButtonClassName} ${activeShortcut === 'current' ? shortcutSelectedClassName : ''}`}
									onClick={() => handleShortcut(0)}
								>
									Mês atual
								</button>
								<button
									type="button"
									aria-pressed={activeShortcut === 'next'}
									className={`${shortcutButtonClassName} ${activeShortcut === 'next' ? shortcutSelectedClassName : ''}`}
									onClick={() => handleShortcut(1)}
								>
									Próximo mês
								</button>
							</div>

							<div className="flex flex-col sm:flex-row justify-end gap-3">
								<button
									type="button"
									onClick={clearFilters}
									className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
								>
									<FiX />
									Limpar
								</button>
								<button
									type='submit'
									className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
								>
									<FiSearch />
									Buscar
								</button>
							</div>
						</div>
					</form>

					<div className="mt-4 mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-200">
							<p className="text-xs uppercase text-slate-500">Gastos fixos do mês</p>
							<strong className="block mt-2 text-2xl font-semibold text-white">{formatToBRL(getTotal(fixedTransactions))}</strong>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-200">
							<p className="text-xs uppercase text-slate-500">Gastos variáveis do mês</p>
							<strong className="block mt-2 text-2xl font-semibold text-white">{formatToBRL(getTotal(variableTransactions))}</strong>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-200">
							<p className="text-xs uppercase text-slate-500">Total do extrato</p>
							<strong className="block mt-2 text-2xl font-semibold text-white">{formatToBRL(getTotal([...fixedTransactions, ...variableTransactions]))}</strong>
						</div>
					</div>

					<TableListTransaction
						list={fixedTransactions}
						title='Gastos fixos do mês'
						reload={loadTransaction}
						cards={cards}
					/>

					<div className="h-6" />

					<TableListTransaction
						list={variableTransactions}
						title='Gastos variáveis do mês'
						reload={loadTransaction}
						cards={cards}
					/>

				</div>
			</div>
		</>
	)
}
