import { useState, useEffect, FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { Navbar } from '../components/Navbar'
import { SelectComponent } from '../components/SelectComponent'
import { typePayOptions } from '../services/typePayOptions'
import { categoryOptions } from '../services/categoryOptions'
import { date_now } from '../services/dateCreate'
import { setDividedInTransaction } from '../services/operationDividedIn'

export function FormTransaction(){

	useEffect(() => {
		loadCards()
	},[])

	const navigate = useNavigate()
	let [cards, setCards] = useState([])
	let [value, setValue] = useState('')
	let [type, setType] = useState('')
	let [description, setDescription] = useState('')
	let [category, setCategory] = useState('')
	let [card, setCard] = useState('')
	let [message, setMessage] = useState('')
	let [colorMessage, setColorMessage] = useState('#AA1008')
	let [isDivided, setIsDivided] = useState(false)
	let [dividedIn, setDividedIn] = useState(0)
	const ID_USER = localStorage.getItem('iden')

	if(value.includes(',')){
			setValue(value.replace(',','.'))
	}

	//cargas las tarjetas
	async function loadCards(){
		await API.get(`/card/all-card/user/${ID_USER}`)
		.then(resp => {
			setCards(resp.data.card)
		})
	}

	//agregar una neva transaccion
	async function setNewTransaction(event: FormEvent){
		event.preventDefault()

		if(card === 'default'){
			setCard('')
		}

		if(dividedIn <= 0){
			setIsDivided(false)
		}else{
			setIsDivided(true)
		}

		let date = date_now()

		if(!value || !type || !description || !category){
			setMessage('Los campos no pueden ser enviados vacios.')
		}else if(parseFloat(value) <= 0 || isNaN(parseInt(value))){
			setMessage('El valor no puede ser enviado.')
		}else if(dividedIn < 0){
			setMessage('El numero de cuotas es invalido')
		}else{		

			(parseFloat(value)).toFixed(2)

			if(dividedIn >= 2){
				if(dividedIn >= 24){
					setMessage(`Como las cuotas superan los dos años,
								Te recomendamos agregarlo como una categoria: 'Gasto fijo'
								y las cuotas en '0'.`)
				}else{
					setDividedInTransaction(value, description, category, type, card, dividedIn, isDivided)
					setMessage(`LA TRANSACCION SE AGREGO!, fue divida en ${dividedIn} partes, el monto a pagar por mes es: $ ${parseInt(value)/dividedIn}.`)
					setColorMessage('#0e5f7d')
				}
			}else{
				await API.post('/operation/new-transaction', 
						 {value, description, category, type, date, card, dividedIn, isDivided})
				.then(() => {
					navigate('/')
				})
				.catch(() =>{
					setMessage('No se pudo agregar la transacción.')
				})
			}

		}
	}

	return(
		<>
		<Navbar />
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

					<div className="flex justify-around items-center w-9/12 m-auto h-20">
						<p className='text-red-500 normal-case w-5/12 h-12' style={{color: colorMessage}}>{message}</p>
					</div>

					<div className="flex justify-between w-1/4 m-auto">
						<button type="submit" className=" my-8 bg-sky-600 w-36 py-2 hover:bg-sky-500 rounded m-auto">Agregar</button>
					</div>
			</form>
		</div>
		</>
	)
}