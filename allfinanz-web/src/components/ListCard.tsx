import { Card } from './Card'

export function ListCard(){
	return(
		<div className="flex">
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