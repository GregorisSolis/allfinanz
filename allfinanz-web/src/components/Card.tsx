export function Card(props){

	let backgroundValue = props.backgroundValue//'#9c44dc'
	let colorFont = props.colorFont

	return(
		<div className='min-w-[300px] h-[210px] shadow-md rounded m-4 p-4 flex-col' style={{background: backgroundValue, color: colorFont}} >
			<div className='h-16'>
				<h1 className="text-4xl">{props.nameCard}</h1>
			</div>

			<div className="w-full">
				<span className="text-xs flex justify-end">uso del mes</span>
				<p className="text-2xl font-bold flex justify-end ">$ {props.totalUsed}</p>
			</div>

			<div>
				<span className="text-xs">Cierre de factura:</span>
				<p className="text-xl">dia {props.dayCloseCheck}</p>
			</div>


		</div>
	)
}