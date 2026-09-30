import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { TableListTransaction } from '../components/TableListTransaction'
import { toast } from 'react-toastify'
import { categoryOptions } from '../services/categoryOptions'
import { FiFilter, FiRefreshCw, FiSearch, FiX } from 'react-icons/fi'
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
	let [isFilterOpen, setIsFilterOpen] = useState(false)

	const shortcutButtonClassName = "min-w-0 rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-2 text-center text-xs font-semibold leading-tight text-slate-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] sm:flex-none sm:px-3"
	const shortcutSelectedClassName = "border-emerald-300/50 text-emerald-200"

	useEffect(() => {
		if (!isFilterOpen) return
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setIsFilterOpen(false)
		}
		window.addEventListener('keydown', handleKeyDown)
		return () => window.removeEventListener('keydown', handleKeyDown)
	}, [isFilterOpen])

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
		setIsFilterOpen(false)
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
		setIsFilterOpen(false)
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

	async function applyFilters(clearShortcut = true) {
		if (startDate && endDate && startDate > endDate) {
			toast.warning('A data inicial não pode ser maior que a data final.')
			return false
		}

		const params: Record<string, string> = {}
		if (startDate) params.date_init = startDate
		if (endDate) params.date_end = endDate
		if (category) params.category = category
		if (card) params.card = card
		if (description.trim()) params.description = description.trim()
		if (clearShortcut) setActiveShortcut(null)

		if (Object.keys(params).length === 0) {
			await loadTransaction()
			setIsFilterOpen(false)
			return true
		}

		try {
			const res = await API.get('/transaction/search', { withCredentials: true, params })
			splitTransactions(res.data.transactions || [])
			setIsFilterOpen(false)
			return true
		} catch (err) {
			toast.error('Erro ao buscar transações.')
			return false
		}
	}

	async function setSearch(event: FormEvent) {
		event.preventDefault()
		await applyFilters()
	}

	useEffect(() => {
		loadCards()
	}, [])


	return (
		<>
			<div className="w-full pb-28 h-screen overflow-y-auto scrollbar-thin scrollbar-thumb-brand-200 scrollbar-track-brand-600 hover:scrollbar-thumb-brand-100 md:pr-4">

				<div className="w-full px-3 py-4 sm:p-4">
					<ButtonAddTransaction />

					<div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="text-sm font-medium text-slate-400">Extrato</p>
							<h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Movimentações</h1>
							<p className="mt-2 text-sm text-slate-400">Consulte e filtre suas transações.</p>
						</div>
						<div className="flex items-center gap-2">
							<div className="relative">
								<button
									type="button"
									aria-haspopup="dialog"
									aria-expanded={isFilterOpen}
									className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
									onClick={() => setIsFilterOpen((open) => !open)}
								>
									<FiFilter />
									Filtros
								</button>
								{isFilterOpen && (
									<div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-0 md:absolute md:inset-auto md:right-0 md:top-full md:z-40 md:block md:w-[min(900px,calc(100vw-18rem))] md:bg-transparent md:p-0">
										<button type="button" aria-label="Fechar filtros" className="absolute inset-0 md:hidden" onClick={() => setIsFilterOpen(false)} />
										<div role="dialog" aria-modal="true" aria-labelledby="extract-filters-title" className="relative z-10 max-h-[90dvh] w-full max-w-none overflow-y-auto rounded-none border border-white/10 bg-[#0d1117] p-3 text-slate-200 shadow-2xl sm:p-4 md:mt-2 md:max-h-[calc(100vh-2rem)] md:rounded-lg md:max-w-none">
											<div className="mb-5 flex items-start justify-between gap-3">
												<div className="min-w-0">
													<h2 id="extract-filters-title" className="text-sm font-semibold text-white">Filtros do extrato</h2>
													<p className="break-words text-sm text-slate-400">Refine o extrato por período, descrição, categoria ou cartão.</p>
												</div>
												<button type="button" aria-label="Fechar filtros" className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white md:hidden" onClick={() => setIsFilterOpen(false)}>
													<FiX />
												</button>
											</div>
											<form onSubmit={setSearch} className="w-full max-w-full">
												<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-12 gap-3 sm:gap-4 items-end">
													<div className="min-w-0 max-w-full xl:col-span-2 flex flex-col">
														<label className="text-xs uppercase tracking-[0.12em] text-slate-300 mb-2 sm:tracking-[0.2em]" htmlFor="startDate">Data início</label>
														<input id="startDate" type="date" className="block w-full max-w-full min-w-0 appearance-none rounded-lg bg-transparent px-2.5 py-2.5 text-[13px] text-slate-200 [color-scheme:dark] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition sm:px-4 sm:text-sm" onChange={e => setStartDate(e.target.value)} value={startDate} />
													</div>
													<div className="min-w-0 max-w-full xl:col-span-2 flex flex-col">
														<label className="text-xs uppercase tracking-[0.12em] text-slate-300 mb-2 sm:tracking-[0.2em]" htmlFor="endDate">Data fim</label>
														<input id="endDate" type="date" className="block w-full max-w-full min-w-0 appearance-none rounded-lg bg-transparent px-2.5 py-2.5 text-[13px] text-slate-200 [color-scheme:dark] border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition sm:px-4 sm:text-sm" onChange={e => setEndDate(e.target.value)} value={endDate} />
													</div>
													<div className="min-w-0 md:col-span-2 xl:col-span-4 flex flex-col">
														<label className="text-xs uppercase tracking-[0.12em] text-slate-300 mb-2 sm:tracking-[0.2em]" htmlFor="description">Descrição</label>
														<input id="description" type="text" placeholder="Exemplo: Mercado do mês..." className="w-full min-w-0 rounded-lg bg-transparent px-3 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition placeholder:text-slate-500 sm:px-4" onChange={e => setDescription(e.target.value)} value={description} autoComplete="off" />
													</div>
													<div className="min-w-0 xl:col-span-2 flex flex-col">
														<label className="text-xs uppercase tracking-[0.12em] text-slate-300 mb-2 sm:tracking-[0.2em]" htmlFor="category">Categoria</label>
														<select id="category" className="w-full min-w-0 rounded-lg bg-transparent px-3 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition sm:px-4" onChange={e => setCategory(e.target.value)} value={category}>
															<option value="">Selecione</option>
															{categoryOptions.map(option => (
																<option key={option._id} value={option._id}>{option.name}</option>
															))}
														</select>
													</div>
													<div className="min-w-0 xl:col-span-2 flex flex-col">
														<label className="text-xs uppercase tracking-[0.12em] text-slate-300 mb-2 sm:tracking-[0.2em]" htmlFor="card">Cartão</label>
														<select
															id="card"
															className="w-full min-w-0 rounded-lg bg-transparent px-3 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition sm:px-4"
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
													<div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
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
															className={`${shortcutButtonClassName} col-span-2 sm:col-span-1 ${activeShortcut === 'next' ? shortcutSelectedClassName : ''}`}
															onClick={() => handleShortcut(1)}
														>
															Próximo mês
														</button>
													</div>

													<div className="grid min-w-0 grid-cols-2 gap-2 sm:flex sm:flex-row sm:justify-end sm:gap-3">
														<button
															type="button"
															onClick={clearFilters}
															className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-3 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] sm:px-4"
														>
															<FiX />
															Limpar
														</button>
														<button
															type='submit'
															className="inline-flex min-w-0 items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300 px-3 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] sm:px-4"
														>
															<FiSearch />
															Buscar
														</button>
													</div>
												</div>
											</form>
										</div>
									</div>
								)}
							</div>
							<button
								type="button"
								className="inline-flex w-fit items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08]"
								onClick={() => applyFilters(false)}
								>
								<FiRefreshCw />
								Atualizar
							</button>
						</div>
					</div>

					<div className="mt-4 mb-6 grid grid-cols-1 gap-3 md:grid-cols-3 md:gap-4">
						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-200">
							<p className="text-xs uppercase text-slate-500">Gastos fixos do mês</p>
							<strong className="block mt-2 break-words text-xl font-semibold text-white sm:text-2xl">{formatToBRL(getTotal(fixedTransactions))}</strong>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-200">
							<p className="text-xs uppercase text-slate-500">Gastos variáveis do mês</p>
							<strong className="block mt-2 break-words text-xl font-semibold text-white sm:text-2xl">{formatToBRL(getTotal(variableTransactions))}</strong>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-200">
							<p className="text-xs uppercase text-slate-500">Total do extrato</p>
							<strong className="block mt-2 break-words text-xl font-semibold text-white sm:text-2xl">{formatToBRL(getTotal([...fixedTransactions, ...variableTransactions]))}</strong>
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
