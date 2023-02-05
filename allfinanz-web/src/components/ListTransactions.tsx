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
		<div className="lg:w-[70%] md:w-[90%]">
			<ButtonAdd text="Agregar nueva transacción" action={() => navigate('/nueva/transaccion')} width='90%'/>
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
		</div>
	)
}