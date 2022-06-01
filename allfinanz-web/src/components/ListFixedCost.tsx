import { useNavigate } from 'react-router-dom'

import { ItemTransaction } from './ItemTransaction'
import { ButtonAdd } from './ButtonAdd'


export function ListFixedCost(){

	const navigate = useNavigate()

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
			<ButtonAdd text="Agregar nuevo gasto fijo" action={() => navigate('transaccion/nueva')} width='90%'/>
		</div>
	)
}