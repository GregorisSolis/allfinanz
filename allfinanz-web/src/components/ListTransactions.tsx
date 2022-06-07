import { useNavigate } from 'react-router-dom'
import { ItemTransaction } from './ItemTransaction'
import { ButtonAdd } from './ButtonAdd'

interface ListTransactionProps {
	list: never[],
	reload: () => void
}

export function ListTransactions(props: ListTransactionProps){

	const navigate = useNavigate()
	let list = props.list
	
	
	return(
		<div className="w-[70%]">
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
			<ButtonAdd text="Agregar nueva transacción" action={() => navigate('/nueva/transaccion')} width='90%'/>
		</div>
	)
}