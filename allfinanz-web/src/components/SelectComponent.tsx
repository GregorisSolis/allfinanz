import { FormEvent } from "react";

interface SelectComponentProps {
	list: any[],
	default: string;
	change: (event: FormEvent) => void

}

export function SelectComponent(props: SelectComponentProps): JSX.Element{

	let list = props.list

	return(
		<select 
			className="lg:mx-4 rounded bg-brand-200 border-b-2 large-content-input w-5/12 h-12 text-xl my-6 outline-none"
			onChange={props.change}
		>
			<option className="bg-brand-800" value=''>{props.default}</option>
			{list.map((item: any) => (
				<option 
					className="bg-brand-800" 
					key={item._id} 
					value={item.value}
				>{item.name}
				</option>	
			))}
		</select>
	)
}