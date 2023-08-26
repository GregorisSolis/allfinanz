import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

import { Navbar } from '../components/Navbar'
import { SelectComponent } from '../components/SelectComponent'
import { MessageComponent } from '../components/MessageComponent'

import { typePayOptions } from '../services/typePayOptions'
import { categoryOptions } from '../services/categoryOptions'
import { date_now } from '../services/dateCreate'
import { setDividedInTransaction } from '../services/operationDividedIn'
import { API } from '../services/api'

export function FormTransaction() {

	useEffect(() => {
		loadCards()
	}, [])

	const navigate = useNavigate();
	let [cards, setCards] = useState([])
	let [value, setValue] = useState('')
	let [type, setType] = useState('')
	let [description, setDescription] = useState('')
	let [category, setCategory] = useState('')
	let [card, setCard] = useState('')
	let [dividedIn, setDividedIn] = useState(0)
	let [isDivided, setIsDivided] = useState(false)

	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')
	let [typeMessage, setTypeMessage] = useState('')
	let [linkMessage, setLinkMessage] = useState('0')
	const ID_USER = localStorage.getItem('iden')

	if (value.includes(',')) {
		setValue(value.replace(',', '.'))
	}

	//cargas las tarjetas
	async function loadCards() {
		await API.get(`/card/all-card/user/${ID_USER}`)
			.then(resp => {
				setCards(resp.data.card)
			})
	}

	//agregar una neva transaccion
	async function setNewTransaction(event: FormEvent) {
		event.preventDefault()


		if (card === 'default') {
			setCard('')
		}

		if (dividedIn <= 0) {
			setIsDivided(false)
		} else {
			setIsDivided(true)
		}

		let date = date_now()

		if (!value || !type || !description || !category) {
			setDividedInTransaction(value, description, category, type, card, dividedIn, isDivided);
			setTextMessage('Los campos no pueden ser enviados vacios.')
			setTypeMessage('error');
			setIsMessage(true)
		} else if (parseFloat(value) <= 0 || isNaN(parseInt(value))) {
			setTextMessage('El valor no se puede agregar.')
			setTypeMessage('error');
			setIsMessage(true)
		} else if (dividedIn < 0) {
			setTextMessage('El numero de cuotas es invalido')
			setTypeMessage('error');
			setIsMessage(true)
		} else {

			(parseFloat(value)).toFixed(2)

			if (dividedIn >= 2) {
				if (dividedIn >= 24) {
					setTextMessage(`Como las cuotas superan los dos años, Te recomendamos agregarlo como una categoria: 'Gasto fijo' y las cuotas en '0'.`)
					setIsMessage(true)
				} else {
					setDividedInTransaction(value, description, category, type, card, dividedIn, isDivided)
					setTextMessage(`La transacción fue divida en ${dividedIn} partes, el monto a pagar los proximos ${dividedIn} meses es: $ ${(parseFloat(value)/dividedIn).toFixed(2)}`)
					setTypeMessage('info');
					setLinkMessage('Ir a Dashboard')
					setIsMessage(true)
					setValue('')
					setDescription('')
					setDividedIn(0)
				}
			} else {
				await API.post('/operation/new-transaction',
					{ value, description, category, type, date, card, dividedIn, isDivided })
					.then(() => {
						setTextMessage('Transacción agregada con exito.');
						setTypeMessage('success');
						setLinkMessage('Ir a Dashboard')
						setIsMessage(true);
						setDividedIn(0)
						setValue('')
						setDescription('')
					})
					.catch(() => {
						setTextMessage('No se pudo agregar la transacción.')
						setTypeMessage('error');
						setIsMessage(true)
					})
			}

		}
	}

	function clearAlertMessage(){
		setLinkMessage('0');
		setIsMessage(false);
	}

	//ESTE CODIGO SE ENCARGA DE FORMATAR EL PRECIO
	if(value.length > 2){
		value = value.replace(/\./g, '');
		value = value.replace(/^0+(?=[1-9])/, '');
		
		
		let before = value.slice(0, -2);
		let after = value.slice(-2);
		value = before + "." +after;
	}
	value = value.replace(/^\./, '');
	value = value.replace(/^[a-zA-Z]+/, '');
	value = value.replace(/^[^a-zA-Z0-9]+/, '');
	value = value.trim();

	return (
		<>
			<Navbar location='' />
			<div className="m-0 w-full">
				<form className="text-white flex flex-col p-4 rounded text-center lg:w-11/12 md:w-[90%] my-4 m-auto" onSubmit={setNewTransaction}>
					<h1 className="text-4xl mb-4 text-white-500">Nueva Transacción</h1>

					<div className="lg:flex md:grid justify-around large-content w-9/12 my-4 m-auto">
						<input
							className="rounded lg:w-5/12 md:w-full m-auto my-6 px-1 text-xl bg-brand-200 h-12 border-b-2 focus:border-sky-500 outline-none"
							onChange={e => setValue(e.target.value)}
							placeholder="0.00"
							value={value}
						/>
						<input
							className="rounded lg:w-5/12 md:w-full m-auto my-6 px-1 text-xl bg-brand-200 h-12 border-b-2 focus:border-sky-500 outline-none"
							onChange={e => setDescription(e.target.value)}
							placeholder="Descripción"
							value={description}
						/>
					</div>

					<div className="lg:flex md:grid justify-around w-9/12 m-auto">
						<SelectComponent
							list={typePayOptions}
							change={(e: any) => setType(e.target.value)}
							default='Tipo de pago'
						/>

						<SelectComponent
							list={categoryOptions}
							change={(e: any) => setCategory(e.target.value)}
							default='Categoria'
						/>
					</div>

					<div className="lg:flex md:block justify-around w-9/12 m-auto">
						<SelectComponent
							list={cards}
							change={(e: any) => setCard(e.target.value)}
							default='Tarjeta'
						/>

						<input
							className="rounded lg:w-5/12 md:w-100 my-6 px-1 text-xl bg-brand-200 h-12 border-b-2 focus:border-sky-500 outline-none"
							onChange={(e: any) => setDividedIn(e.target.value)}
							placeholder="Numero de cuotas"
							type="number"
							min="0"
							value={dividedIn}
						/>
					</div>
			
					{isMessage ? 
						<MessageComponent 
							text={textMessage} 
							type={typeMessage} 
							link_title={linkMessage} 
							link={() => navigate('/dashboard')} 
							action={() => clearAlertMessage()} 
						/> 
					: null}

					<div className="flex justify-between w-1/4 m-auto mb-4">
						<button type="submit" className=" my-8 bg-sky-600 w-36 py-2 hover:bg-sky-500 rounded m-auto">Agregar</button>
					</div>
				</form>
			</div>
		</>
	)
}