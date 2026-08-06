import { useState, useEffect } from 'react'
import { Cpu, Pen, Trash } from 'phosphor-react'
import { API } from '../services/api'
import { toast } from 'react-toastify'
import Dialog from './Dialog'
import { NewCard } from './NewCard'
import { formatToBRL } from '../services/amountFormat'

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
	}, [props.totalCost])

	let IDCard = props.IDCard
	let colorFont = props.colorFont
	let backgroundValue = props.backgroundValue
	let [totalCost, setTotalCost] = useState(0)
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
			<div className="relative flex h-96 w-full flex-col overflow-hidden rounded-lg border border-white/10 bg-[#0d1117] p-5 text-slate-200 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] transition hover:bg-white/[0.03]">
				<div
					className="absolute inset-x-0 top-0 h-1"
					style={{ background: backgroundValue as string }}
				/>

				<div className="flex items-start justify-between gap-4">
					<div className="w-full">
						<p className="text-xs uppercase tracking-[0.2em] text-slate-500">Cartão</p>
						<h2 className="mt-1 truncate text-xl font-semibold text-white">{props.nameCard}</h2>
					</div>

					<div className="flex gap-2 text-slate-400">
						<button
							type="button"
							aria-label={`Remover cartão ${props.nameCard}`}
							title="Remover cartão"
							className="rounded p-1 transition hover:text-red-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
						>
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
						</button>
						<button
							type="button"
							aria-label={`Editar cartão ${props.nameCard}`}
							title="Editar cartão"
							className="rounded p-1 transition hover:text-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
							onClick={() => setShowEdit(true)}
						>
							<Pen size={20} />
						</button>
					</div>
				</div>

				<div
					className="relative mt-5 flex h-64 w-full flex-col justify-between overflow-hidden rounded-lg p-6 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.8)]"
					style={{ background: backgroundValue as string, color: colorFont as string }}
				>
						<div className="flex items-center justify-between gap-3">
							<span className="flex h-8 w-10 items-center justify-center rounded-md bg-white/25 shadow-inner">
								<Cpu size={24} weight="duotone" />
							</span>
							<span className="flex-1 truncate text-right text-xs font-semibold uppercase tracking-[0.2em]">{props.nameCard}</span>
						</div>
						<p className="font-mono text-sm tracking-[0.25em]">**** **** **** 1234</p>
						<div className="grid grid-cols-2 gap-3 pt-3 text-xs">
							<div>
								<p className="uppercase opacity-70">Uso do mês</p>
								<p className="mt-1 text-sm font-semibold">{formatToBRL(totalCost)}</p>
							</div>
							<div className="text-right">
								<p className="uppercase opacity-70">Fechamento</p>
								<p className="mt-1 text-sm font-semibold">Dia {props.cardCloseDay}</p>
							</div>
						</div>
				</div>
			</div>
		</>
	)
}
