import { useState } from 'react'
import { Trash, Pen } from 'phosphor-react'
import { Link } from 'react-router-dom'
import { API } from '../services/api'
import { ModifyTransaction } from './ModifyTransaction'


export function ItemTransaction(props){

	let [isModifyTransaction, setIsModifyTransaction] = useState(false)

	function removeTransaction(){
		API.delete(`/operation/romeve-transaction/${props._id}`)
		.then(resp => {
			props.reload()
		})
	}

	return(
		<div className="w-[90%] flex justify-between bg-brand-200 p-4 m-4 rounded shadow-lg">
			<div className="w-24">
				<div className="text-center">
					<span className="text-sky-200">Tipo</span>
					<p className="mt-2">{props.type}</p>
				</div>
			</div>	

			<div className="w-24">
				<div className="text-center">
					<span className="text-sky-200">Categoria</span>
					<p className="mt-2">{props.category}</p>
				</div>
			</div>

			<div className="w-24">
				<div className="text-center">
					<span className="text-sky-200">Valor</span>
					<p className="mt-2">{props.value}</p>
				</div>
			</div>

			<div className="w-24">
				<div className="text-center">
					<span className="text-sky-200">Descripción</span>
					<p className="mt-2">{props.description}</p>
				</div>
			</div>

			<div className="w-24">
				<div className="text-center">
					<span className="text-sky-200">Config</span>
					<div className='flex justify-center items-center'>
						<Trash className="hover:text-red-500 mt-2" onClick={() => removeTransaction()} size={20}/>
						<Pen className="hover:text-sky-500 mt-2" onClick={() => setIsModifyTransaction(true)} size={20}/>
					</div>
				</div>

				{isModifyTransaction? 
					<ModifyTransaction
						_id={props._id}
						category={props.category} 
						value={props.value} 
						description={props.description}
						closeComponent={() => setIsModifyTransaction(false)}
						reload={() => props.reload()}
					/>
				:null}
			</div>

		</div>
	)
}