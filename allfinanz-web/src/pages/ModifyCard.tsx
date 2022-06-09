import { FormEvent, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Navbar } from '../components/Navbar'
import { Card } from '../components/Card'
import { API } from '../services/api'
import { MessageComponent } from '../components/MessageComponent'
import { date_now } from '../services/dateCreate'

export function ModifyCard() {

	useEffect(() => {
		loadCard()
	}, [])

	const { nameCard } = useParams()
	const ID_USER = localStorage.getItem('iden')
	const navigate = useNavigate()
	let [name, setName] = useState('')
	let [cardID, setCardID] = useState('')
	let [color, setColor] = useState('')
	let [colorFont, setColorFont] = useState('')
	let [cardCloseDay, setCardCloseDay] = useState('')
	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')

	async function loadCard() {
		await API.get(`/card/card-data/${nameCard}/user/${ID_USER}`)
			.then(resp => {
				setName(resp.data.card[0].name)
				setColor(resp.data.card[0].color)
				setColorFont(resp.data.card[0].colorFont)
				setCardCloseDay(resp.data.card[0].cardCloseDay)
				setCardID(resp.data.card[0]._id)
			})
			.catch(() => {
				navigate('/')
			})
	}

	async function setUpdateCard(event: FormEvent) {
		event.preventDefault()

		if (!color || !colorFont || !cardCloseDay) {
			setTextMessage('Los campos no pueden estar vacio.')
			setIsMessage(true)
		} else if (parseInt(cardCloseDay) <= 0 || parseInt(cardCloseDay) > 31) {
			setTextMessage('No se puede editar la tarjeta.')
			setIsMessage(true)
		}
		else {
			await API.patch(`/card/edit-card/${cardID}`, { color, colorFont, cardCloseDay })
				.then(() => {
					loadCard()
					setTextMessage('La tarjeta se ha editado.')
					setIsMessage(true)
				})
				.catch(() => {
					setTextMessage('Error al editar la tarjeta.')
					setIsMessage(true)

				})
		}
	}

	return (
		<>
			<Navbar location='' />
			{isMessage ? <MessageComponent text={textMessage} action={() => setIsMessage(false)} /> : null}

			<div className="w-full min:h-96 text-white flex justify-center items-center my-16">

				<div className="w-1/4">
					<Card
						IDCard={cardID}
						nameCard={name}
						backgroundValue={color}
						colorFont={colorFont}
						cardCloseDay={cardCloseDay}
						reload={() => loadCard()}
						date={date_now()}
						listCostFixed={[]}
						listCostMonth={[]}
					/>
				</div>

				<div className="min:w-1/4 w-1/4 rounded bg-brand-200 shadow-lg p-4">
					<form onSubmit={setUpdateCard} className="flex flex-col text-center">
						<h1 className="text-4xl mb-8">{name}</h1>
						<div>
							<input
								type="color"
								className="transition w-1/4 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-500 outline-none"
								value={color}
								onChange={e => setColor(e.target.value)}
							/>
							<span className="text-xs mx-4">Color de la tarjeta</span>
						</div>
						<div>
							<input
								type="color"
								className="transition w-1/4 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-500 outline-none"
								onChange={e => setColorFont(e.target.value)}
								value={colorFont}
							/>
							<span className="text-xs mx-4">Color de las letras</span>
						</div>
						<div >
							<input
								type="number"
								className="transition w-11/12 m-auto my-2 px-1 text-xl bg-transparent border-b-2 hover:border-sky-500 outline-none"
								placeholder={cardCloseDay}
								onChange={e => setCardCloseDay(e.target.value)}
							/>
							<span className="text-xs mx-3 flex">Dia de cierre</span>
						</div>
						<div>
							<button type="submit" className="transition my-8 bg-sky-600 w-40 py-2 hover:bg-sky-500 rounded m-auto">Editar tarjeta</button>
						</div>
					</form>
				</div>
			</div>
		</>
	)
}