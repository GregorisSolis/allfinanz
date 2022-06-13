import { useEffect, useState } from 'react'
import { Card } from './Card'
import { NewCard } from './NewCard'
import { ButtonAdd } from './ButtonAdd'
import { API } from '../services/api'

interface ListCardProps {
	listCostFixed: never[],
	listCostMonth: never[],
	date: { year: number, month: number, day: number }
}

export function ListCard(props: ListCardProps) {

	useEffect(() => {
		loadCardUser()
	}, [])

	const ID_USER = localStorage.getItem('iden')
	let [isNewCard, setIsNewCard] = useState(false)
	const [cards, setCards] = useState([])

	async function loadCardUser() {
		await API.get(`/card/all-card/user/${ID_USER}`)
			.then(resp => {
				setCards(resp.data.card)
			})
	}



	return (
		<div className="flex lg:overflow-x-auto md:overflow-x-hidden overflow-y-hidden scrollbar scrollbar-thumb-zinc-700 scrollbar-thin">

			{cards.map((card: any) => (
				<Card
					key={card._id}
					IDCard={card._id}
					nameCard={card.name}
					cardCloseDay={card.cardCloseDay}
					backgroundValue={card.color}
					colorFont={card.colorFont}
					reload={() => loadCardUser()}
					listCostFixed={props.listCostFixed}
					listCostMonth={props.listCostMonth}
					date={props.date}
				/>
			))}

			<ButtonAdd width='300px' text='Agregar nueva tarjeta' action={() => setIsNewCard(true)} />
			{isNewCard ? <NewCard closeComponent={() => setIsNewCard(false)} reload={() => loadCardUser()} /> : null}
		</div>
	)
}