import { Plus } from 'phosphor-react'

interface ButtonAddProps{
	action: () => void,
	width?: string,
	text?: string
}

export function ButtonAdd(props: ButtonAddProps){
	return(
		<button 
			className={`
				flex flex-col justify-center items-center transition text-white hover:text-white 
				m-4 rounded-2xl hover:shadow-2xl text-lg shadow-lg border border-white/30 hover:border-white/60
				min-h-[180px] min-w-[260px] max-w-[320px] p-8
				bg-white/20 backdrop-blur-md
			`}
			style={{ width: props.width || '300px' }}
			onClick={props.action}
		>
			<div className="flex flex-col items-center justify-center">
				<Plus size={48} className="mb-2 bg-white/30 p-2 rounded-full shadow-md backdrop-blur-sm" />
				<span className="mt-2 font-semibold tracking-wide text-xl">
					{props.text || 'Adicionar cartão'}
				</span>
			</div>
		</button>
	)
}