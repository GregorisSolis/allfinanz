import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Pen, Trash } from 'phosphor-react'
import { API } from '../services/api'
import { date_now } from '../services/dateCreate'
import { toast } from 'react-toastify'
import Dialog from './Dialog'
import { NewCard } from './NewCard'
import { formatToBRL, formatToBRL_report } from '../services/amountFormat'

interface CardProps {
	backgroundValue: String,
	colorFont: String,
	nameCard: String,
	IDCard: String,
	date: {year: number, month: number, day: number},
	cardCloseDay: String,
	totalCost: number,
	reload: () => void
}

export function CardItem(props: CardProps) {

	useEffect(() => {
		loadTotalMonth()
	})

	let IDCard = props.IDCard
	let colorFont = props.colorFont
	let backgroundValue = props.backgroundValue
	let [totalCost, setTotalCost] = useState(0)
	let date = props.date
	let [showDialog, setShowDialog] = useState(false)
	let [showEdit, setShowEdit] = useState(false)


	function loadTotalMonth() {
		setTotalCost(props.totalCost)
	}

	function removeCard() {
		API.delete(`/card/remove-card/${IDCard}`, { withCredentials: true })
			.then(() => {
				toast.success('Cartão removido com sucesso!')
				props.reload()
			})
			.catch(() => {
				toast.error('Erro ao remover o cartão.')
			})
	}

	let displayValue = 'block';
	if(!window.location.pathname.includes('modificar')){
		// displayValue = totalCost < 1 ? 'none' : 'block';
	}

	return (
		<>
			{showEdit && (
				<NewCard
					reload={props.reload}
					closeComponent={() => setShowEdit(false)}
					cardToEdit={{
						_id: IDCard as string,
						name: props.nameCard as string,
						cardCloseDay: Number(props.cardCloseDay),
						color: backgroundValue as string,
						colorFont: colorFont as string
					}}
				/>
			)}
			<div
				className="min-w-[320px] max-w-[350px] h-[210px] shadow-xl rounded-2xl m-4 p-0 flex flex-col justify-between relative overflow-hidden transition-transform duration-200 hover:scale-105 hover:opacity-90"
				style={{ background: backgroundValue as string, color: colorFont as string, display: displayValue }}
			>
				{/* Chip e ícones */}
				<div className="flex items-center justify-between px-6 pt-5">
					<div className="w-10 h-7 bg-yellow-400 rounded-md shadow-inner mr-2" title="chip" />
					<div className="flex gap-2">
						<p className="hover:text-red-500 cursor-pointer">
							<Dialog
								title="Remover cartão?"
								description={`Tem certeza que deseja remover o cartão '${props.nameCard}'? Essa ação não pode ser desfeita.`}
								open={showDialog}
								onOpenChange={setShowDialog}
								onConfirm={() => { setShowDialog(false); removeCard(); }}
								onCancel={() => setShowDialog(false)}
								confirmText="Remover"
								cancelText="Cancelar"
								confirmVariant="destructive"
							>
								<span onClick={e => { e.stopPropagation(); setShowDialog(true); }}>
									<Trash size={20} />
								</span>
							</Dialog>
						</p>
						<Link to="#" className="hover:text-sky-500" onClick={e => { e.preventDefault(); setShowEdit(true); }}><Pen size={20} /></Link>
					</div>
				</div>

				{/* Nome do banco */}
				<div className="px-6 mt-2">
					<h1 className="text-2xl font-bold tracking-widest uppercase drop-shadow-sm">{props.nameCard}</h1>
				</div>

				{/* Número fictício */}
				<div className="px-6 mt-4">
					<p className="text-lg tracking-widest font-mono select-none">**** **** **** 1234</p>
				</div>

				{/* Valor */}
				<div className="px-6 mt-2 flex flex-col items-end">
					<span className="text-xs">Uso do mês</span>
					<p className="text-2xl font-bold">$ {formatToBRL(totalCost)}</p>
				</div>

				{/* Fechamento */}
				<div className="absolute bottom-3 left-6 flex flex-col">
					<span className="text-xs">Cierre de factura</span>
					<span className="text-base font-semibold">dia {props.cardCloseDay}</span>
				</div>
			</div>
		</>
	)
}