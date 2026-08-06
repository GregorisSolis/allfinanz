import { FormEvent, useState, useEffect } from 'react'
import { API } from '../services/api'
import { toast } from 'react-toastify'

interface NewCardProps{
	reload: () => void,
	closeComponent: () => void,
	cardToEdit?: {
		_id: string,
		name: string,
		cardCloseDay: number,
		color: string,
		colorFont: string
	}
}

export function NewCard(props: NewCardProps) {
	const isEdit = !!props.cardToEdit;
	let [name, setName] = useState('')
	let [cardCloseDay, setCardCloseDay] = useState(0)
	let [color, setColor] = useState('#000000')
	let [colorFont, setColorFont] = useState('#ffffff')
	let [isLoading, setIsLoading] = useState(false)

	useEffect(() => {
		if (isEdit && props.cardToEdit) {
			setName(props.cardToEdit.name)
			setCardCloseDay(props.cardToEdit.cardCloseDay)
			setColor(props.cardToEdit.color)
			setColorFont(props.cardToEdit.colorFont)
		}
	}, [isEdit, props.cardToEdit])

	async function handleSubmit(event: FormEvent) {
		event.preventDefault()
		if (!name || !cardCloseDay) {
			toast.error('Por favor, preencha todos os campos.')
			return
		} else if (isNaN(cardCloseDay) || cardCloseDay <= 0 || cardCloseDay > 31) {
			toast.warning('O dia de fechamento deve ser entre 1 e 31.')
			return
		}
		setIsLoading(true)
		try {
			if (isEdit && props.cardToEdit) {
				await API.patch(`/card/edit-card/${props.cardToEdit._id}`, { name, cardCloseDay, color, colorFont }, { withCredentials: true })
				toast.success('Cartão editado com sucesso!')
			} else {
				await API.post('/card/new-card/', { name, cardCloseDay, color, colorFont }, { withCredentials: true })
				toast.success('Cartão criado com sucesso!')
			}
			props.reload()
			props.closeComponent()
		} catch (err) {
			toast.error(isEdit ? 'Erro ao editar cartão.' : 'Erro ao criar cartão.')
		} finally {
			setIsLoading(false)
		}
	}

	return (
		<>
			<div className="bg-black/60 backdrop-blur-sm fixed inset-0 animate-fadeIn z-40 transition-opacity duration-300" />
			<div className="fixed inset-x-4 top-1/2 z-50 max-w-md -translate-y-1/2 rounded-lg border border-white/10 bg-[#0d1117] p-6 text-slate-200 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] transition-all duration-300 sm:left-1/2 sm:right-auto sm:w-full sm:-translate-x-1/2">
				<form className="flex flex-col gap-4" onSubmit={handleSubmit}>
					<div>
						<h1 className="text-xl font-semibold text-white">{isEdit ? 'Editar cartão' : 'Adicionar novo cartão'}</h1>
						<p className="mt-1 text-sm text-slate-400">Informe os dados do cartão para acompanhar seus gastos.</p>
					</div>

					<div className="flex flex-col gap-2">
						<label className="text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor="cardName">Nome</label>
						<input
							id="cardName"
							type="text"
							className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition placeholder:text-slate-500"
							placeholder="Nome do cartão"
							value={name}
							onChange={e => setName(e.target.value)}
						/>
					</div>

					<div className="flex flex-col gap-2">
						<label className="text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor="cardCloseDay">Fechamento</label>
						<input
							id="cardCloseDay"
							type="number"
							className="w-full rounded-lg bg-transparent px-4 py-2.5 text-sm text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500 transition placeholder:text-slate-500"
							placeholder="Dia de fechamento (1-31)"
							value={cardCloseDay}
							onChange={e => setCardCloseDay(Number(e.target.value))}
						/>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
							<label className="text-xs uppercase text-slate-500">Cor do fundo</label>
							<input
								type="color"
								value={color}
								onChange={e => setColor(e.target.value)}
								className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
							/>
						</div>
						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-3">
							<label className="text-xs uppercase text-slate-500">Cor da fonte</label>
							<input
								type="color"
								value={colorFont}
								onChange={e => setColorFont(e.target.value)}
								className="mt-2 h-10 w-full cursor-pointer rounded-lg border border-white/10 bg-transparent"
							/>
						</div>
					</div>

					<div
						className="rounded-lg border border-white/10 p-4"
						style={{ background: color, color: colorFont }}
					>
						<p className="text-xs font-semibold uppercase tracking-[0.2em]">Preview</p>
						<p className="mt-3 truncate text-lg font-semibold">{name || 'Nome do cartão'}</p>
					</div>

					<div className="flex flex-col justify-end gap-3 pt-2 sm:flex-row">
						<button
							className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60"
							type="button"
							onClick={() => props.closeComponent()}
							disabled={isLoading}
						>
							Cancelar
						</button>
						<button
							className="rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60"
							type="submit"
							disabled={isLoading}
						>
							{isLoading ? 'Enviando...' : (isEdit ? 'Salvar' : 'Confirmar')}
						</button>
					</div>
				</form>
			</div>
		</>
	)
}
