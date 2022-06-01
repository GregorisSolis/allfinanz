export function SelectComponent(props){

	let list = props.list

	return(
		<select 
			className="rounded bg-brand-200 border-b-2 w-5/12 h-12 text-xl my-6 outline-none" 
			onChange={props.change}
		>
			<option className="bg-brand-800" value='default'>{props.default}</option>
			{list.map((item) => (
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