import { DotsThreeVertical } from 'phosphor-react'

export function ItemTransaction(props){

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
					<DotsThreeVertical size={32} className="m-auto cursor-pointer hover:text-sky-900 transition mt-2" />
				</div>
			</div>

		</div>
	)
}