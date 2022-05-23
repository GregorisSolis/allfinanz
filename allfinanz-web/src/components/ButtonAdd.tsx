import { Plus } from 'phosphor-react'

export function ButtonAdd(props){
	return(
		<button className=" transition flex justify-center items-center hover:text-sky-200 bg-brand-200 p-4 m-4 rounded hover:shadow-xl text-sm" style={{minWidth: props.width}}>
			{props.text} <Plus size={28} className="mx-2 bg-brand-200 p-1 rounded-full"/>
		</button>
	)
}