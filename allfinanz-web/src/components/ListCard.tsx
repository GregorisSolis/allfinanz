import { useEffect, useState } from 'react'
import { Card } from './Card'
import { NewCard } from './NewCard'
import { ButtonAdd } from './ButtonAdd'
import { API } from '../services/api'

export function ListCard(){

	useEffect(() => {
		loadCardUser()
	},[])

	const ID_USER = localStorage.getItem('iden')
	let [isNewCard, setIsNewCard] = useState(false)
	const [cards, setCards] = useState([])

	async function loadCardUser(){
		await API.get(`/card/all-card/user/${ID_USER}`)
		.then(resp => {
			setCards(resp.data.card)
			console.log(resp.data.card)
		})
	}

	return(
		<div className="flex overflow-x-auto overflow-y-hidden scrollbar scrollbar-thumb-zinc-700 scrollbar-thin">
			<ButtonAdd width='300px' text='Agregar nueva tarjeta' action={() => setIsNewCard(true)}/>
			
			{cards.map((card) => (
				<Card 
					key={card._id}
					IDCard={card._id}
					nameCard={card.name}
					totalUsed='126.1'
					cardCloseDay={card.cardCloseDay}
					backgroundValue={card.color}
					colorFont={card.colorFont}
					reload={() => loadCardUser()}
				/>		
			))}

			{isNewCard ? <NewCard closeComponent={() => setIsNewCard(false)} reload={() => loadCardUser()} /> : null}
		</div>
	)
}