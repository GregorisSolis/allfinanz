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

	const navigate = useNavigate()
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
	let [titleMessage, setTitleMessage] = useState('')
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
			setDividedInTransaction(value, description, category, type, card, dividedIn, isDivided)
			setTitleMessage('Error')
			setTextMessage('Los campos no pueden ser enviados vacios.')
			setIsMessage(true)
		} else if (parseFloat(value) <= 0 || isNaN(parseInt(value))) {
			setTitleMessage('Error')
			setTextMessage('El valor no se puede agregar.')
			setIsMessage(true)
		} else if (dividedIn < 0) {
			setTitleMessage('Error')
			setTextMessage('El numero de cuotas es invalido')
			setIsMessage(true)
		} else {

			(parseFloat(value)).toFixed(2)

			if (dividedIn >= 2) {
				if (dividedIn >= 24) {
					setTitleMessage('Error')
					setTextMessage(`Como las cuotas superan los dos años, Te recomendamos agregarlo como una categoria: 'Gasto fijo' y las cuotas en '0'.`)
					setIsMessage(true)
				} else {
					setDividedInTransaction(value, description, category, type, card, dividedIn, isDivided)
					setTitleMessage('Transacción Realizada')
					setTextMessage(` Fue divida en ${dividedIn} partes, el monto a pagar por mes es: $ ${parseInt(value) / dividedIn}.`)
					setIsMessage(true)
				}
			} else {
				await API.post('/operation/new-transaction',
					{ value, description, category, type, date, card, dividedIn, isDivided })
					.then(() => {
						navigate('/')
					})
					.catch(() => {
						setTitleMessage('Error')
						setTextMessage('No se pudo agregar la transacción.')
						setIsMessage(true)
					})
			}

		}
	}

	return (
		<>
			<Navbar location='' />
			<div className="m-0 w-full">
				<form className="text-white flex flex-col p-4 rounded text-center w-11/12 m-auto" onSubmit={setNewTransaction}>
					<h1 className="text-4xl mb-4 text-sky-500">Nueva Transacción</h1>

					<div className="flex justify-around w-9/12 m-auto">
						<input
							className="rounded w-5/12 m-auto my-6 px-1 text-xl bg-brand-200 h-12 border-b-2 focus:border-sky-500 outline-none"
							onChange={e => setValue(e.target.value)}
							placeholder="Valor"
						/>
						<input
							className="rounded w-5/12 m-auto my-6 px-1 text-xl bg-brand-200 h-12 border-b-2 focus:border-sky-500 outline-none"
							onChange={e => setDescription(e.target.value)}
							placeholder="Descripción"
						/>
					</div>

					<div className="flex justify-around w-9/12 m-auto">
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

					<div className="flex justify-around w-9/12 m-auto">
						<SelectComponent
							list={cards}
							change={(e: any) => setCard(e.target.value)}
							default='Tarjeta'
						/>

						<input
							className="rounded w-5/12 my-6 px-1 text-xl bg-brand-200 h-12 border-b-2 focus:border-sky-500 outline-none"
							onChange={(e: any) => setDividedIn(e.target.value)}
							placeholder="Numero de cuotas"
							type="number"
						/>
					</div>

					{isMessage ? <MessageComponent title={titleMessage} text={textMessage} action={() => setIsMessage(false)} /> : null}

					<div className="flex justify-between w-1/4 m-auto">
						<button type="submit" className=" my-8 bg-sky-600 w-36 py-2 hover:bg-sky-500 rounded m-auto">Agregar</button>
					</div>
				</form>
			</div>
		</>
	)
}