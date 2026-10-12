import { useState, useEffect } from 'react'
import { Cpu, Pen, Trash } from 'phosphor-react'
import { API } from '../services/api'
import { toast } from 'react-toastify'
import Dialog from './Dialog'
import { NewCard } from './NewCard'
import { formatToBRL } from '../services/amountFormat'

interface CardProps {
	backgroundValue: string,
	colorFont: string,
	nameCard: string,
	IDCard: string,
	cardCloseDay: number,
	totalCost: number,
	reload: () => void
}

export function CardItem(props: CardProps) {

	useEffect(() => {
		loadTotalMonth()
	}, [props.totalCost])

	const IDCard = props.IDCard
	const colorFont = props.colorFont
	const backgroundValue = props.backgroundValue
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
			<div className="group relative flex min-h-[330px] w-full flex-col overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0b1320]/90 p-4 text-slate-200 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] transition duration-300 hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-[0_28px_70px_-40px_rgba(0,0,0,0.95)] sm:p-5">
				<div
					className="absolute inset-x-0 top-0 h-1 opacity-90"
					style={{ background: backgroundValue as string }}
				/>

				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0">
						<p className="text-xs font-medium uppercase tracking-[0.16em] text-slate-400">Cartão</p>
						<h2 className="mt-1 truncate text-lg font-semibold text-white sm:text-xl">{props.nameCard}</h2>
					</div>

					<div className="flex shrink-0 gap-1 text-slate-400 opacity-100 transition sm:opacity-70 sm:group-hover:opacity-100">
						<button
							type="button"
							aria-label={`Remover cartão ${props.nameCard}`}
							title="Remover cartão"
							className="rounded-lg p-2 transition hover:bg-red-400/10 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-300"
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
							className="rounded-lg p-2 transition hover:bg-sky-300/10 hover:text-sky-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
							onClick={() => setShowEdit(true)}
						>
							<Pen size={20} />
						</button>
					</div>
				</div>

				<div
					className="relative mt-5 flex min-h-[220px] w-full flex-1 flex-col justify-between overflow-hidden rounded-2xl p-5 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.8)] sm:min-h-[230px] sm:p-6"
					style={{ background: backgroundValue as string, color: colorFont as string }}
				>
						<div className="pointer-events-none absolute -right-8 -top-10 h-40 w-40 rounded-full border border-white/20 bg-white/[0.06]" />
						<div className="pointer-events-none absolute -bottom-24 -left-12 h-48 w-48 rounded-full border border-white/15" />
						<div className="relative flex items-center justify-between gap-3">
							<span className="flex h-9 w-11 items-center justify-center rounded-lg border border-white/20 bg-white/15 shadow-inner backdrop-blur-sm">
								<Cpu size={24} weight="duotone" />
							</span>
							<span className="rounded-full border border-white/20 bg-black/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em]">Crédito</span>
						</div>
						<div className="relative mt-6 grid grid-cols-2 gap-3 border-t border-white/20 pt-4 text-xs">
							<div>
								<p className="uppercase tracking-[0.12em] opacity-75">Gastos no ciclo</p>
								<p className="mt-1 break-words text-base font-semibold sm:text-lg">{formatToBRL(totalCost)}</p>
							</div>
							<div className="text-right">
								<p className="uppercase tracking-[0.12em] opacity-75">Fecha no dia</p>
								<p className="mt-1 text-base font-semibold sm:text-lg">{props.cardCloseDay}</p>
							</div>
						</div>
				</div>
			</div>
		</>
	)
}
