import { useNavigate } from 'react-router-dom'
import { ItemTransaction } from './ItemTransaction'
import { ButtonAdd } from './ButtonAdd'

interface listFixedCostProps{
	list: never[],
	reload: () => void
}

export function ListFixedCost(props: listFixedCostProps){

	const navigate = useNavigate()
	let list = props.list
	
	return(
		<div className="lg:w-[70%] md:w-[100%]">
			{list.map((item: any) => (
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