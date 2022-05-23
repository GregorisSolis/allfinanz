import { Card } from './Card'
import { ButtonAdd } from './ButtonAdd'

export function ListCard(){
	return(
		<div className="flex overflow-x-auto overflow-y-hidden scrollbar scrollbar-thumb-zinc-700 scrollbar-thin">
			<ButtonAdd width='300px' text='Agregar nueva tarjeta'/>
			<Card 
				nameCard='Inter'
				totalUsed='126.1'
				dayCloseCheck='17'
				backgroundValue='orange'
				colorFont='white'
			/>					

			<Card 
				nameCard='Nubank'
				totalUsed='126.1'
				dayCloseCheck='17'
				backgroundValue='#9c44dc'
				colorFont='white'
			/>					

			<Card 
				nameCard='Riachuelo'
				totalUsed='126.1'
				dayCloseCheck='17'
				backgroundValue='#121212'
				colorFont='white'
			/>
		</div>
	)
}