import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ItemTransaction } from './ItemTransaction'
import { ButtonAdd } from './ButtonAdd'


export function ListFixedCost(props){

	const navigate = useNavigate()
	let list = props.list
	
	return(
		<div className="w-[70%]">
			{list.map((item) => (
				<ItemTransaction
					key={item._id}
					_id={item._id}
					value={item.value.$numberDecimal}
					category={item.category}
					type={item.type+'/'+item.card}
					description={item.description}
					reload={() => props.reload()}
				/>						
			))}
			<ButtonAdd text="Agregar nuevo gasto fijo" action={() => navigate('/nueva/transaccion')} width='90%'/>
		</div>
	)
}