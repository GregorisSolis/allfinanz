import { useState, useEffect, FormEvent } 	from 'react'
import { useNavigate, useParams } 						from 'react-router-dom'


import { typePayOptions } 			from '../services/typePayOptions'
import { categoryOptions } 			from '../services/categoryOptions'
import { date_now } 				from '../services/dateCreate'
import { setDividedInTransaction }  from '../services/operationDividedIn'
import { API } 						from '../services/api'
import { toast } from 'react-toastify'
import Dialog from '../components/Dialog'
import { formatToBRL, formatToNumber } from '../services/amountFormat'
import { SideBar } from '../components/SideBar'

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

	const ID_USER = localStorage.getItem('iden')

	//cargas las tarjetas
	async function loadCards() {
		await API.get(`/card/all-card/user/${ID_USER}`)
			.then(resp => {
				setCards(resp.data.card)
			})
	}

	async function getTransaction() {
		await API.get(`/transaction/${id}`, { params: { user_id: ID_USER } })
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

		let date = date_now();
		let fixed = false;
		if (category === '1') {
			fixed = true;
		}

		if (!validateAndPrepareTransaction({ amount, type, description, category, source, dividedIn })) {
			return;
		}

		if (dividedIn >= 2) {
			if (dividedIn >= 120) {
				toast.info(`Como as parcelas excedem dois anos, recomendamos que você o adicione como uma categoria: 'Custo fixo' e as parcelas em '0'.`)
			} else {
				setDividedInTransaction(amount, description, category, type, card, dividedIn, true, fixed)
				toast.info(`A transação foi dividida em ${dividedIn} parcelas, o valor a ser pago nos próximos ${dividedIn} meses é: R$ ${formatToBRL(amount / dividedIn)}`)
				setAmount(0)
				setDescription('')
				setDividedIn(0)
				setShowDialog(true)
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
					})
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
					})
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
		setShowDialog(false);
	}

	function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
		const raw = e.target.value.replace(/\D/g, ''); // Solo números
	  
		const numeric = Number(raw);
		setAmount(numeric);
	  
		const formatted = formatToBRL(numeric);
		setInputValue(formatted);
	}

	return (
		<section className='flex w-5/6 mx-auto my-5'>
			<section className='w-1/4 mr-6'>
				<SideBar />
			</section>
		
			<div className="my-0 bg-slate-900 text-white p-6 rounded-xl shadow-lg w-full mx-auto">

				<form
					className="space-y-6"
					onSubmit={id ? setUpdateTransaction : setNewTransaction}
					noValidate
				>
					<h2 className="text-2xl font-thin">{ id ? "Editar" : "Nova" } Transação</h2>

					{/* Formulario principal */}
					<div className='grid grid-cols-[1fr_4fr] items-center gap-x-4 max-w-3xl m-auto'>
						<label className='text-right' htmlFor="description">Descrição</label>
						<input
							type="text"
							id="description"
							placeholder="Exemplo: Mercado do mês..."
							className="rounded bg-transparent px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2"
							onChange={e => setDescription(e.target.value)}
							value={description}
							autoComplete="off"
						/>
					</div>
					
					<div className='grid grid-cols-[1fr_4fr] items-center gap-x-4 max-w-3xl m-auto'>
						<label className='text-right' htmlFor="amount">
							Valor <small className='text-muted'>(R$)</small>
						</label>
						<input
							type="text"
							id="amount"
							placeholder="Valor"
							className="rounded bg-transparent px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2"
							onChange={handleChange}
							value={inputValue}
							autoComplete="off"
						/>
					</div>

					<div className="grid grid-cols-[1fr_4fr] items-center gap-x-4 max-w-3xl m-auto">
						<label className="text-right" htmlFor='category'>Categoria</label>
						<select
							id="category"
							value={category}
							onChange={e => setCategory(e.target.value)}
							className="rounded bg-slate-900 px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2"
						>
							{categoryOptions.map(option => (
								<option key={option.value} value={option._id}>
									{option.name}
								</option>
							))}
						</select>
					</div>

					<div className="grid grid-cols-[1fr_4fr] items-center gap-x-4 max-w-3xl m-auto">
						<label className="text-right" htmlFor='source'>Descontar</label>
						<select
							id="source"
							value={source}
							onChange={e => setSource(e.target.value)}
							className="rounded bg-slate-900 px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2"
						>
							<option value="">Selecione</option>
							<option value="salary">Descontar do salário</option>
							<option value="carryover">Descontar do lazer</option>
							<option value="savings">Descontar da poupança</option>

						</select>
					</div>
					
					<div className='grid grid-cols-[1fr_4fr] items-center gap-x-4 max-w-3xl m-auto'>
						<label className='text-right' htmlFor="dividedIn">N° Parcelas</label>
						<input
							type="number"
							id="dividedIn"
							min="0"
							placeholder="N° de parcelas"
							className="rounded bg-transparent px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2"
							onChange={(e) => setDividedIn(Number(e.target.value))}
							value={dividedIn}
							autoComplete="off"
							disabled={category === '1'}
						/>
					</div> 

					<div className="grid grid-cols-[1fr_4fr] items-center gap-x-4 max-w-3xl m-auto">
						<label className="text-right" htmlFor='type'>Tipo de Pagamento</label>
						<select
							id="type"
							value={type}
							onChange={e => setType(e.target.value)}
							className="rounded bg-slate-900 px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2"
						>
							{typePayOptions.map(option => (
								<option key={option.value} value={option._id}>
									{option.name}
								</option>
							))}
						</select>
					</div>
					

					{(type === 'credit' || type === 'debit') && (
						<div className="grid grid-cols-[1fr_4fr] items-center gap-x-4 max-w-3xl">
							<label className="text-right" htmlFor='card'>Cartões</label>
							<select
								id="card"
								value={card}
								onChange={e => setCard(e.target.value)}
								className="rounded bg-slate-900 px-4 py-3 outline-none text-xl w-full border border-slate-700 border-2"
								disabled={cards.length === 0}
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
					<div className="flex justify-center">
						<button
							type="submit"
							className="bg-sky-600 hover:bg-sky-500 py-3 px-10 rounded text-lg font-semibold transition"
						>
							{id ? "Editar" : "Adicionar"}
						</button>
					</div>
				</form>

				<Dialog
					open={showDialog}
					onOpenChange={setShowDialog}
					title="Transação Adicionada com Sucesso!"
					description="O que você deseja fazer agora?"
					onConfirm={handleGoToDashboard}
					onCancel={handleAddAnother}
					confirmText="Ir para o Dashboard"
					cancelText={id ? "Continuar Aditando" : "Adicionar Outra"}
					confirmVariant="default"
				/>
			</div>
		</section>
	);
}