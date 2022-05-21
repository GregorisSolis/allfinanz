import { ItemTransaction } from './ItemTransaction'

export function ListFixedCost(){
	return(
		<div className="w-[70%]">
			<ItemTransaction
				value='450.5'
				category='Casa'
				type='Debito/Itau'
				description='aluguel'
			/>						
			<ItemTransaction
				value='30.43'
				category='otro'
				type='Credito/Inter'
				description='Bicicleta'
			/>	
			<ItemTransaction
				value='199.33'
				category='entretenimiento'
				type='Credito/Nubank'
				description='Coca cola'
			/>
		</div>
	)
}