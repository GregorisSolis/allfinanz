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
			className="rounded bg-brand-200 border-b-2 lg:w-5/12 md:w-96 h-12 text-xl my-6 outline-none"
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