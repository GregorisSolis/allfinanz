import { useState, useEffect, FormEvent, ChangeEvent } 	from 'react'
import { useNavigate, useParams } 						from 'react-router-dom'
import { FiCreditCard, FiDollarSign, FiEdit3, FiRepeat, FiSave, FiTag } from 'react-icons/fi'


import { typePayOptions } 			from '../services/typePayOptions'
import { categoryOptions } 			from '../services/categoryOptions'
import { date_now } 				from '../services/dateCreate'
import { setDividedInTransaction }  from '../services/operationDividedIn'
import { API } 						from '../services/api'
import { toast } from 'react-toastify'
import Dialog from '../components/Dialog'
import { formatToBRL } from '../services/amountFormat'

const fieldWrapperClassName = 'flex flex-col gap-2'
const labelClassName = 'text-xs uppercase tracking-[0.2em] text-slate-300'
const fieldClassName = 'w-full rounded-lg bg-transparent px-4 py-3 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition placeholder:text-slate-500 disabled:cursor-not-allowed disabled:opacity-60'
const selectClassName = `${fieldClassName} bg-[#0d1117]`

export function FormTransaction() {

	const { id } = useParams();

	useEffect(() => {
		loadCards();

		if(id){
			getTransaction();
		}

	}, [])

	const navigate = useNavigate();
	const [showDialog, setShowDialog] = useState(false);
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
		await API.get(`/transaction/${id}`, { withCredentials: true })
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
			});
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
						fixed
					},
					{ withCredentials: true }
				)
			}
			if(!id){
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

		return (
			<section className="text-slate-100 pb-24">
				<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-sm font-medium text-slate-400">{id ? 'Editar gasto' : 'Novo gasto'}</p>
						<h1 className="mt-1 text-2xl font-semibold text-white">{ id ? 'Editar transação' : 'Adicionar transação' }</h1>
						<p className="mt-2 text-sm text-slate-400">
							Registre despesas, parcelamentos e recorrências no seu controle financeiro.
						</p>
					</div>
				</div>

				<div className="rounded-lg border border-white/10 bg-[#0d1117] p-4 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] sm:p-6">
					<div className="mb-6 flex items-center gap-2 text-sm font-semibold text-white">
						<FiEdit3 className="text-slate-400" />
						Dados da transação
					</div>

				<form
					className="space-y-6"
					onSubmit={id ? setUpdateTransaction : setNewTransaction}
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
							Valor <small className='text-muted'>(R$)</small>
						</label>
						<div className="relative">
							<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
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
							disabled={fixed}
						/>
					</div> 
					
					<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
						<label className="flex items-start gap-3" htmlFor="fixed">
							<input
								type="checkbox"
								id="fixed"
								className="mt-1 h-4 w-4 rounded border-slate-600 bg-transparent text-emerald-300 focus:ring-emerald-300"
								checked={fixed}
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
					{type === '1' && (
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
					<div className="flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
						<div className="flex items-center gap-2 text-sm text-slate-400">
							{fixed ? <FiRepeat className="text-slate-500" /> : type === '1' ? <FiCreditCard className="text-slate-500" /> : <FiTag className="text-slate-500" />}
							{fixed ? 'Será tratado como gasto mensal recorrente.' : dividedIn > 1 ? `Será dividido em ${dividedIn} parcelas.` : 'Preencha os dados para salvar.'}
						</div>
						<button
							type="submit"
							className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
						>
							<FiSave />
							{id ? "Editar" : "Adicionar"}
						</button>
					</div>
				</form>
				</div>

				<Dialog
					open={showDialog}
					onOpenChange={setShowDialog}
					title="Transação Adicionada com Sucesso!"
					description="O que você deseja fazer agora?"
					onConfirm={handleGoToDashboard}
					onCancel={handleAddAnother}
					confirmText="Ir para o Dashboard"
					cancelText={id ? "Continuar Editando" : "Adicionar Outra"}
					confirmVariant="default"
				/>
			</section>
	);
}
