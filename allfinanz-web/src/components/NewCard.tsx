import { useState } from 'react'
import { API } from '../services/api'

export function NewCard(props){

	let [message, setMessage] = useState('')
	let [name, setName] = useState('')
	let [cardCloseDay, setCardCloseDay] = useState('')
	let [color, setColor] = useState('#000')
	let [colorFont, setColorFont] = useState('#000')

	function setNewCard(event: FormEvent){
		event.preventDefault()

		if(!name || !cardCloseDay){
			setMessage("Todos los campos son obligatorio.")
		}else if(isNaN(cardCloseDay) || cardCloseDay <= 0 || cardCloseDay > 31){
			setMessage('Fecha invalida, intenta de nuevo.')
		}else{
			API.post('/card/new-card/',{name,cardCloseDay,color,colorFont})
			.then(resp => {
				setAmountNumberCardUSer(resp.data.card.user)
				props.reload()
				props.closeComponent()
			})
		}
	}

	function setAmountNumberCardUSer(ID_USER){
		let amountCard = 0

		API.get(`/auth/info-user/${ID_USER}`)
		.then(resp => {
			amountCard = resp.data.user.amountCard
		})

		amountCard = amountCard + 1

		API.put(`/auth/edit/${ID_USER}`, {amountCard})
	}

	return(
		<div className="fixed bg-brand-100 inset-0 flex justify-center items-center transition">
			<form className="lg:w-1/4 sm:w-11/12 bg-brand-800 rounded flex flex-col p-4 shadow-lg" onSubmit={setNewCard}>
				<h1 className="text-2xl text-center">Nueva Tarjeta</h1>
				<input 
					className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500"
					placeholder="Nombre de la tarjeta"
					onChange={e => setName(e.target.value)}
				/>		
				<input 
					className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500"
					placeholder="Cierre de factura"
					type="number"
					onChange={e => setCardCloseDay(e.target.value)}
				/>
				<input 
					className="m-4 mb-0 w-1/4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500"
					type="color"
					onChange={e => setColor(e.target.value)}
				/>
				<span className="text-xs m-4 mt-0">Elige un color para el fondo de la tarjeta</span>				
				<input 
					className="m-4 w-1/4 mb-0 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500"
					type="color"
					onChange={e => setColorFont(e.target.value)}
				/>
				<span className="text-xs m-4 mt-0">Elige un color para la letra de la tarjeta</span>
				<p className='mt-2 text-center text-orange-500 normal-case transition h-12'>{message}</p>
				<div className="w-full flex justify-center items-center ">
					<button className="mx-4 bg-sky-600 rounded p-2" type="submit">Confirmar</button>
					<button className="mx-4 bg-red-600 rounded p-2" onClick={() => props.closeComponent()}>Cerrar</button>
				</div>
			</form>
		</div>
	)
}