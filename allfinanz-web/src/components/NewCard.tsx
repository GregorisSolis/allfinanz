import { FormEvent, useState } from 'react'
import { API } from '../services/api'

interface NewCardProps{
	reload: () => void,
	closeComponent: () => void,
}

export function NewCard(props: NewCardProps) {

	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')
	let [name, setName] = useState('')
	let [cardCloseDay, setCardCloseDay] = useState(0)
	let [color, setColor] = useState('#000000')
	let [colorFont, setColorFont] = useState('#000000')

	function setNewCard(event: FormEvent) {
		event.preventDefault()

		if (!name || !cardCloseDay) {
			setTextMessage("Todos los campos son obligatorio.")
			setIsMessage(true)
		} else if (isNaN(cardCloseDay) || cardCloseDay <= 0 || cardCloseDay > 31) {
			setTextMessage('Fecha invalida, intenta de nuevo.')
			setIsMessage(true)
		} else {
			API.post('/card/new-card/', { name, cardCloseDay, color, colorFont })
				.then(() => {
					props.reload()
					props.closeComponent()
				})
		}
	}

	return (
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
					onChange={(e: any) => setCardCloseDay(e.target.value)}
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
				<div className="w-full flex justify-center items-center ">
					<button className="mx-4 bg-sky-600 rounded p-2" type="submit">Confirmar</button>
					<button className="mx-4 bg-red-600 rounded p-2" onClick={() => props.closeComponent()}>Cerrar</button>
				</div>
			</form>
		</div>
	)
}