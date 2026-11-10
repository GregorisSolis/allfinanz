import { useState, useEffect, FormEvent, ChangeEvent } 	from 'react'
import { useNavigate, useParams, useSearchParams } 						from 'react-router-dom'
import { FiArrowLeft, FiBookOpen, FiBriefcase, FiCoffee, FiCopy, FiCreditCard, FiDollarSign, FiEdit3, FiGift, FiHeart, FiHome, FiMap, FiRepeat, FiSave, FiShoppingBag, FiShoppingCart, FiTag, FiTrash2, FiTruck, FiWifi, FiZap } from 'react-icons/fi'
import { RiCoinsLine, RiQrCodeLine } from 'react-icons/ri'
import type { IconType } from 'react-icons'


import { typePayOptions } 			from '../services/typePayOptions'
import { categoryOptions } 			from '../services/categoryOptions'
import { date_now } 				from '../services/dateCreate'
import { setDividedInTransaction }  from '../services/operationDividedIn'
import { API } 						from '../services/api'
import { toast } from 'react-toastify'
import Dialog from '../components/Dialog'
import { formatToBRL } from '../services/amountFormat'

const fieldWrapperClassName = 'flex flex-col gap-2'
const labelClassName = 'text-xs font-medium uppercase tracking-[0.16em] text-slate-300'
const fieldClassName = 'w-full rounded-xl border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-slate-100 transition placeholder:text-slate-500 focus:border-sky-400/50 focus:outline-none focus:ring-2 focus:ring-sky-400/15 disabled:cursor-not-allowed disabled:opacity-60'
const selectClassName = `${fieldClassName} bg-[#0e1b2b]`

const expenseIconRules: { categories: string[]; keywords: string[]; icon: IconType }[] = [
	{ categories: ['7'], keywords: ['internet', 'wifi', 'wi-fi', 'roteador', 'modem', 'telefone', 'telefonia', 'fibra'], icon: FiWifi },
	{ categories: [], keywords: ['energia', 'conta de luz', 'eletricidade', 'eletrica', 'eletrico'], icon: FiZap },
	{ categories: ['13'], keywords: ['escola', 'faculdade', 'curso', 'livro', 'caderno', 'material escolar', 'educacao'], icon: FiBookOpen },
	{ categories: ['2'], keywords: ['consulta', 'remedio', 'farmacia', 'exame', 'dentista', 'terapia'], icon: FiHeart },
	{ categories: ['4'], keywords: ['mercado', 'supermercado', 'feira', 'alimentos'], icon: FiShoppingCart },
	{ categories: ['5'], keywords: ['uber', 'taxi', 'combustivel', 'onibus', 'metro', 'transporte'], icon: FiTruck },
	{ categories: ['12'], keywords: ['restaurante', 'cafe', 'lanchonete', 'pizza'], icon: FiCoffee },
	{ categories: ['6'], keywords: ['presente', 'lembranca', 'doacao'], icon: FiGift },
	{ categories: ['8'], keywords: ['viagem', 'passagem', 'hotel', 'hospedagem'], icon: FiMap },
	{ categories: ['3'], keywords: ['roupa', 'calcado', 'vestuario'], icon: FiShoppingBag },
	{ categories: ['9'], keywords: ['familia', 'filho', 'crianca'], icon: FiHeart },
	{ categories: ['10'], keywords: ['aluguel', 'condominio', 'moradia', 'casa'], icon: FiHome },
	{ categories: ['11'], keywords: ['servico', 'manutencao', 'assinatura'], icon: FiBriefcase },
]

function normalizeIconSearch(value: string) {
	return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function getExpenseIcon(description: string, category: string): IconType | undefined {
	const title = normalizeIconSearch(description)
	const categoryName = normalizeIconSearch(
		categoryOptions.find(option => String(option._id) === String(category))?.name || ''
	)
	const categoryId = String(category)

	const titleMatch = expenseIconRules.find(rule =>
		rule.keywords.some(keyword => title.includes(normalizeIconSearch(keyword)))
	)
	if (titleMatch) return titleMatch.icon

	return expenseIconRules.find(rule =>
		rule.categories.includes(categoryId) ||
		rule.keywords.some(keyword => categoryName.includes(normalizeIconSearch(keyword)))
	)?.icon
}

export function FormTransaction() {

	const { id } = useParams();
	const [searchParams] = useSearchParams();
	const isCopy = searchParams.get('copy') === 'next-month';
	const isEditing = Boolean(id) && !isCopy;

	useEffect(() => {
		loadCards();

		if(id){
			setIsTransactionLoading(true);
			getTransaction();
		}

	}, [id, isCopy])

	const navigate = useNavigate();
	const [showDialog, setShowDialog] = useState(false);
	const [isAdjusting, setIsAdjusting] = useState(false);
	const [showCopyConfirmation, setShowCopyConfirmation] = useState(false);
	const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
	const [isTransactionLoading, setIsTransactionLoading] = useState(Boolean(id));
	let [cards, setCards] = useState<any[]>([])
	const [amount, setAmount] = useState(0);
	const [inputValue, setInputValue] = useState('');
	let [type, setType] = useState('')
	let [source, setSource] = useState('')
	let [description, setDescription] = useState('')
	let [category, setCategory] = useState('')
	let [card, setCard] = useState('')
	let [dividedIn, setDividedIn] = useState(0)
	let [isDivided, setIsDivided] = useState(false)
	let [fixed, setFixed] = useState(false)
	let [transactionDate, setTransactionDate] = useState(date_now())

	//cargas las tarjetas
	async function loadCards() {
		await API.get('/card/all-card/user', { withCredentials: true })
			.then(resp => {
				setCards(resp.data.cards)
			})
	}

	async function getTransaction() {
		await API.get(`/transaction/${id}`, {
			withCredentials: true,
			params: isCopy ? { copy: 'next-month' } : undefined,
		})
			.then(resp => {
				const data = resp.data.transaction;
				setAmount(data.amount);
				setInputValue(formatToBRL(data.amount));
				setType(data.type);
				setSource(data.source);
				setDescription(data.description);
				setCategory(data.category);
				setCard(data.card || '');
				setDividedIn(data.dividedIn || 0);
				setIsDivided(data.isDivided || false);
				setFixed(data.fixed || false);
				if (data.date) {
					const dateStr = new Date(data.date).toLocaleDateString('sv-SE', {
						timeZone: 'America/Sao_Paulo',
					});
					setTransactionDate(dateStr);
				}
			})
			.catch(() => {
				toast.error('Não foi possível carregar a transação.');
			})
			.finally(() => setIsTransactionLoading(false));
	}

	// Função auxiliar para validação e preparação dos dados da transação
	function validateAndPrepareTransaction({
		amount,
		type,
		description,
		category,
		source,
		dividedIn
	}: {
		amount: number,
		type: string,
		description: string,
		category: string,
		source: string,
		dividedIn: number
	}) {
		if (!amount || !type || !description || !category || !source) {
			toast.error('Os campos não podem ser enviados vazios.')
			return false;
		}
		if (amount <= 0 || isNaN(amount)) {
			toast.error('O valor não pode ser adicionado.')
			return false;
		}
		if (dividedIn < 0) {
			toast.error('O número de parcelas é inválido')
			return false;
		}
		return true;
	}

	// Função genérica para criar ou atualizar transação
	async function handleTransaction({
		event,
		isUpdate = false
	}: {
		event: FormEvent,
		isUpdate?: boolean
	}) {
		event.preventDefault();

		if (card === 'default') {
			setCard('');
		}

		setIsDivided(dividedIn > 0);

		let date = transactionDate;

		if (!validateAndPrepareTransaction({ amount, type, description, category, source, dividedIn })) {
			return;
		}

		if (!isUpdate && dividedIn >= 2) {
			if (dividedIn >= 120) {
				toast.info(`Como as parcelas excedem dois anos, recomendamos que você o adicione como uma categoria: 'Custo fixo' e as parcelas em '0'.`)
			} else {
				try {
					await setDividedInTransaction(amount, description, category, type, source, card, dividedIn, true, fixed, transactionDate)
					toast.info(`A transação foi dividida em ${dividedIn} parcelas, o valor a ser pago nos próximos ${dividedIn} meses é: R$ ${formatToBRL(amount / dividedIn)}`)
					setAmount(0)
					setInputValue('')
					setDescription('')
					setDividedIn(0)
					setShowDialog(true)
				} catch (error) {
					toast.error('Não foi possível adicionar a transação parcelada.')
				}
			}
			return;
		}

		try {
			if (isUpdate) {
				await API.patch(`/transaction/${id}`,
					{
						source,
						amount,
						description,
						category,
						type,
						date,
						card,
						dividedIn,
						isDivided: dividedIn > 0,
						fixed
					},
					{ withCredentials: true }
				)
			} else {
				await API.post('/transaction/',
					{
						source,
						amount,
						description,
						category,
						type,
						date,
						card,
						dividedIn,
						isDivided: dividedIn > 0,
						fixed,
						copyFromTransactionId: isCopy ? id : undefined
					},
					{ withCredentials: true }
				)
			}
			if(!isEditing){
				setAmount(0)
				setDescription('')
				setDividedIn(0)
				setShowDialog(true)
			}else{
				toast.success('Transação editada com sucesso.');
			}
		} catch (error) {
			toast.error('Não foi possível adicionar a transação.')
		}
	}

	//agregar uma neva transaccion
	function setNewTransaction(event: FormEvent) {
		handleTransaction({ event, isUpdate: false });
	}

	function setUpdateTransaction(event: FormEvent) {
		handleTransaction({ event, isUpdate: true });
	}

	function handleGoToDashboard() {
		navigate('/dashboard');
	}

	async function deleteTransaction() {
		try {
			await API.delete(`/transaction/${id}`, { withCredentials: true });
			toast.success('Transação removida com sucesso.');
			navigate('/extrato');
		} catch {
			toast.error('Erro ao remover a transação.');
		}
	}

	function handleAddAnother() {
		// Limpar todos os campos do formulário
		setAmount(0);
		setInputValue('');
		setType('');
		setSource('');
		setDescription('');
		setCategory('');
		setCard('');
		setDividedIn(0);
		setIsDivided(false);
		setFixed(false);
		setTransactionDate(date_now());
		setShowDialog(false);
	}

	function handleChange(e: ChangeEvent<HTMLInputElement>) {
		const raw = e.target.value.replace(/\D/g, ''); // Solo números
	  
		const numeric = Number(raw);
		setAmount(numeric);
	  
		const formatted = formatToBRL(numeric);
		setInputValue(formatted);
	}

	const isCredit = String(type) === '1';
	const isCardPayment = isCredit || String(type) === '2';
	const isPixPayment = String(type) === '4';
	const PaymentIcon = isCardPayment ? FiCreditCard : isPixPayment ? RiQrCodeLine : RiCoinsLine;
	const ExpenseIcon = getExpenseIcon(description, category) || PaymentIcon;
	const categoryLabel = categoryOptions.find(option => String(option._id) === String(category))?.name || 'Categoria não informada';
	const paymentLabel = typePayOptions.find(option => String(option._id) === String(type))?.name || 'Forma de pagamento não informada';
	const sourceLabel = source === 'salary'
		? 'Salário'
		: source === 'carryover'
			? 'Lazer'
			: source === 'savings'
				? 'Poupança'
				: 'Conta de origem não informada';
	const transactionDateLabel = transactionDate
		? new Date(`${transactionDate}T12:00:00`).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
		: 'Data não informada';
	const cardName = card ? cards.find(item => item._id === card)?.name || 'Cartão não encontrado' : '';

		return (
			<section className="text-slate-100 pb-24">
				<div className="mb-6 flex flex-col-reverse gap-4 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<p className="text-sm font-medium text-sky-300">{isEditing ? 'Editar gasto' : isCopy ? 'Copiar gasto' : 'Nova transação'}</p>
						<h1 className="mt-1 text-2xl font-semibold text-white">{isEditing ? 'Editar transação' : isCopy ? 'Copiar transação para o próximo mês' : 'Registrar movimentação'}</h1>
						<p className="mt-2 text-sm text-slate-400">
							Revise os dados registrados e ajuste os detalhes necessários.
						</p>
					</div>
					<button
						type="button"
						onClick={() => navigate('/extrato')}
						className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-sky-300/30 hover:bg-sky-300/[0.06] hover:text-white"
					>
						<FiArrowLeft aria-hidden="true" />
						Voltar ao extrato
					</button>
				</div>

				<div className="mx-auto w-full max-w-4xl">
				{isEditing && !isAdjusting ? (
					<div className="relative overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1320]/90 p-5 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.95)] sm:p-8">
						<div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-blue-500/10 blur-[90px]" />
						<div className="relative z-10 mb-6 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
							<div>
								<p className="text-sm font-semibold text-white">Detalhes da transação</p>
								<p className="mt-1 text-xs text-slate-500">Confira os dados registrados</p>
							</div>
							<div className="flex items-center gap-2">
								<button type="button" aria-label="Copiar para o próximo mês" title="Copiar para o próximo mês" onClick={() => setShowCopyConfirmation(true)} className="rounded-xl border border-sky-300/15 bg-sky-300/[0.06] p-3 text-sky-200 transition hover:border-sky-300/30 hover:bg-sky-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300">
									<FiCopy size={18} />
								</button>
								<button type="button" aria-label="Excluir transação" title="Excluir transação" onClick={() => setShowDeleteConfirmation(true)} className="rounded-xl border border-red-300/15 bg-red-300/[0.05] p-3 text-red-300 transition hover:border-red-300/30 hover:bg-red-300/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300">
									<FiTrash2 size={18} />
								</button>
							</div>
						</div>

						{isTransactionLoading ? (
							<div className="relative z-10 flex min-h-[220px] items-center justify-center text-sm text-slate-400">Carregando transação...</div>
						) : (
							<div className="relative z-10">
								<div className="rounded-2xl border border-sky-300/15 bg-gradient-to-br from-sky-400/[0.08] to-white/[0.02] p-5 sm:p-7">
									<div className="flex flex-wrap items-start justify-between gap-4">
										<div className="flex min-w-0 items-center gap-3">
											<span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-sky-300/20 bg-sky-300/[0.08] text-sky-200">
													<ExpenseIcon className="text-xl" />
											</span>
											<div className="min-w-0">
												<p className="truncate text-base font-semibold text-white">{description || 'Transação sem descrição'}</p>
												<p className="mt-1 text-sm text-slate-400">{categoryLabel}</p>
											</div>
										</div>
										<span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-slate-300">{fixed ? 'Gasto fixo' : dividedIn > 1 ? `${dividedIn} parcelas` : 'À vista'}</span>
									</div>
									<p className="mt-7 text-3xl font-semibold tracking-tight text-white sm:text-4xl">{formatToBRL(amount)}</p>
									<p className="mt-1 text-xs text-slate-500">Valor da movimentação</p>
								</div>

								<div className="mt-4 grid gap-3 sm:grid-cols-2">
									<div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
										<p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Forma de pagamento</p>
										<div className="mt-3 flex items-center gap-3">
											<span className="flex h-9 w-11 items-center justify-center rounded-xl bg-sky-300/10 text-sky-200"><PaymentIcon /></span>
											<p className="truncate text-sm font-medium text-slate-100">{paymentLabel}</p>
										</div>
									</div>
									{cardName && (
										<div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
											<p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Cartão utilizado</p>
											<p className="mt-3 truncate text-sm font-medium text-slate-100">{cardName}</p>
										</div>
									)}
									<div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
										<p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Descontar de</p>
										<p className="mt-3 text-sm font-medium text-slate-100">{sourceLabel}</p>
									</div>
									<div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
										<p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Data</p>
										<p className="mt-3 text-sm font-medium text-slate-100">{transactionDateLabel}</p>
									</div>
									<div className="rounded-xl border border-white/[0.08] bg-white/[0.025] p-4">
										<p className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Categoria</p>
										<p className="mt-3 text-sm font-medium text-slate-100">{categoryLabel}</p>
									</div>
								</div>
							</div>
						)}

						<button
							type="button"
							disabled={isTransactionLoading}
							onClick={() => setIsAdjusting(true)}
							className="relative z-10 mx-auto mt-6 flex h-12 w-full max-w-[360px] items-center justify-center gap-2 rounded-2xl border border-sky-300/30 bg-sky-500 px-6 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(14,165,233,0.65)] transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 disabled:cursor-wait disabled:opacity-60"
						>
							<FiEdit3 />
							Editar transação
						</button>
					</div>
				) : (
				<div className="rounded-2xl border border-white/[0.08] bg-[#0b1320]/90 p-4 shadow-[0_24px_70px_-42px_rgba(0,0,0,0.95)] sm:p-6">
					<div className="mb-6 flex items-center justify-between gap-3 border-b border-white/[0.08] pb-5">
						<div className="flex items-center gap-3">
						<span className="flex h-10 w-10 items-center justify-center rounded-xl border border-sky-300/15 bg-sky-300/[0.08] text-sky-300"><FiEdit3 /></span>
						<div>
							<p className="text-sm font-semibold text-white">Detalhes da transação</p>
							<p className="mt-0.5 text-xs text-slate-500">Preencha as informações da movimentação</p>
						</div>
						</div>
						{isEditing && isAdjusting && <button type="button" onClick={() => setIsAdjusting(false)} className="shrink-0 rounded-xl border border-white/10 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-sky-300/25 hover:bg-sky-300/[0.06] hover:text-sky-100">Ver transação</button>}
					</div>

				<form
					className="space-y-6"
					onSubmit={isEditing ? setUpdateTransaction : setNewTransaction}
					noValidate
				>
					<div className="grid gap-4 lg:grid-cols-2">
					<div className={fieldWrapperClassName}>
						<label className={labelClassName} htmlFor="description">Descrição</label>
						<input
							type="text"
							id="description"
							placeholder="Exemplo: Mercado do mês..."
							className={fieldClassName}
							onChange={e => setDescription(e.target.value)}
							value={description}
							autoComplete="off"
						/>
					</div>
					
					<div className={fieldWrapperClassName}>
						<label className={labelClassName} htmlFor="amount">
							Valor <small className="text-slate-500">(R$)</small>
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sky-300">
								<FiDollarSign size={16} />
							</div>
							<input
								type="text"
								id="amount"
								placeholder="0,00"
								className={`${fieldClassName} pl-10`}
								onChange={handleChange}
								value={inputValue}
								autoComplete="off"
							/>
						</div>
					</div>

					<div className={fieldWrapperClassName}>
						<label className={labelClassName} htmlFor='category'>Categoria</label>
						<select
							id="category"
							value={category}
							onChange={e => setCategory(e.target.value)}
							className={selectClassName}
						>
							{categoryOptions.map(option => (
								<option key={option.value} value={option._id}>
									{option.name}
								</option>
							))}
						</select>
					</div>

					<div className={fieldWrapperClassName}>
						<label className={labelClassName} htmlFor='source'>Descontar</label>
						<select
							id="source"
							value={source}
							onChange={e => setSource(e.target.value)}
							className={selectClassName}
						>
							<option value="">Selecione</option>
							<option value="salary">Descontar do salário</option>
							<option value="carryover">Descontar do lazer</option>
							<option value="savings">Descontar da poupança</option>

						</select>
					</div>
					
				<div className={fieldWrapperClassName}>
						<label className={labelClassName} htmlFor="transactionDate">Data da transação</label>
						<input
							type="date"
							id="transactionDate"
							className={fieldClassName}
							value={transactionDate}
							onChange={e => setTransactionDate(e.target.value)}
							disabled={isCopy}
						/>
					</div>

					<div className={fieldWrapperClassName}>
						<label className={labelClassName} htmlFor="dividedIn">Parcelas</label>
						<input
							type="number"
							id="dividedIn"
							min="0"
							placeholder="0"
							className={fieldClassName}
							onChange={(e) => setDividedIn(Number(e.target.value))}
							value={dividedIn}
							autoComplete="off"
							disabled={fixed || isCopy}
						/>
					</div> 
					
					<div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4">
						<label className="flex items-start gap-3" htmlFor="fixed">
							<input
								type="checkbox"
								id="fixed"
								className="mt-1 h-4 w-4 rounded border-white/20 bg-transparent text-sky-300 focus:ring-sky-300"
								checked={fixed}
								disabled={isCopy}
								onChange={(e) => {
									const checked = e.target.checked;
									setFixed(checked);
									if (checked) {
										setDividedIn(0);
										setIsDivided(false);
									}
								}}
							/>
							<span>
								<span className="block text-sm font-semibold text-white">Gasto fixo</span>
								<span className="mt-1 block text-sm text-slate-400">Transação recorrente mensal, sem parcelamento.</span>
							</span>
						</label>
					</div>

					<div className={fieldWrapperClassName}>
						<label className={labelClassName} htmlFor='type'>Tipo de pagamento</label>
						<select
							id="type"
							value={type}
							onChange={e => setType(e.target.value)}
							className={selectClassName}
						>
							{typePayOptions.map(option => (
								<option key={option.value} value={option._id}>
									{option.name}
								</option>
							))}
						</select>
					</div>
					</div>
					

					{/* Mostrar select de cartões apenas se o tipo for crédito */}
					{isCredit && (
						<div className={fieldWrapperClassName}>
							<label className={labelClassName} htmlFor='card'>Cartão</label>
							<select
								id="card"
								value={card}
								onChange={e => setCard(e.target.value)}
								className={selectClassName}
								disabled={cards?.length === 0}
							>
								{cards.length > 0 ? (
									<>
										<option value="">Selecione um cartão</option>
										{cards.map(option => (
											<option key={option._id} value={option._id}>
												{option.name}
											</option>
										))}
									</>
								) : (
									<option value="">Nenhum cartão cadastrado</option>
								)}
							</select>
						</div>
					)}
		
					{/* Botón */}
					<div className="flex flex-col gap-3 border-t border-white/[0.08] pt-6 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2 text-sm text-slate-400">
							{fixed ? <FiRepeat className="text-sky-300" /> : isCredit ? <FiCreditCard className="text-sky-300" /> : <FiTag className="text-sky-300" />}
							{fixed ? 'Será tratado como gasto mensal recorrente.' : dividedIn > 1 ? `Será dividido em ${dividedIn} parcelas.` : 'Preencha os dados para salvar.'}
						</div>
						<button
							type="submit"
							disabled={isTransactionLoading}
							className="inline-flex items-center justify-center gap-2 rounded-2xl border border-sky-300/30 bg-sky-500 px-6 py-3 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(14,165,233,0.65)] transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1320] disabled:cursor-not-allowed disabled:opacity-60"
						>
							<FiSave />
							{isTransactionLoading ? 'Carregando...' : isEditing ? "Salvar alterações" : isCopy ? "Criar cópia" : "Adicionar"}
						</button>
					</div>
				</form>
				</div>
				)}

				</div>

				<Dialog
					open={showDialog}
					onOpenChange={setShowDialog}
					title="Transação Adicionada com Sucesso!"
					description="O que você deseja fazer agora?"
					onConfirm={handleGoToDashboard}
					onCancel={handleAddAnother}
					confirmText="Ir para o Dashboard"
					cancelText={isEditing ? "Continuar Editando" : "Adicionar Outra"}
					confirmVariant="default"
				/>
				<Dialog
					open={showCopyConfirmation}
					onOpenChange={setShowCopyConfirmation}
					title="Copiar para o próximo mês?"
					description="Uma nova transação será criada para o próximo mês com estes dados."
					onConfirm={() => navigate(`/gasto/${id}?copy=next-month`)}
					confirmText="Copiar transação"
					cancelText="Cancelar"
					confirmVariant="default"
				/>
				<Dialog
					open={showDeleteConfirmation}
					onOpenChange={setShowDeleteConfirmation}
					title="Excluir transação?"
					description="Essa transação será removida permanentemente."
					onConfirm={deleteTransaction}
					confirmText="Excluir"
					cancelText="Cancelar"
				/>
			</section>
	);
}
