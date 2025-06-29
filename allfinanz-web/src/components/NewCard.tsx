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
			<div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 w-[90vw] max-w-md shadow-2xl z-50 border border-slate-700 transition-all duration-300">
				<form className="flex flex-col text-center gap-4" onSubmit={handleSubmit}>
					<h1 className="text-2xl font-bold mb-2 text-white tracking-wide">{isEdit ? 'Editar cartão' : 'Adicionar novo cartão'}</h1>
					<input
						type="text"
						className="rounded-xl px-4 py-3 bg-slate-700/80 border-2 border-slate-700 focus:border-sky-500 outline-none text-white placeholder-gray-400 transition-all duration-200 shadow-sm"
						placeholder="Nome do cartão"
						value={name}
						onChange={e => setName(e.target.value)}
					/>
					<input
						type="number"
						className="rounded-xl px-4 py-3 bg-slate-700/80 border-2 border-slate-700 focus:border-sky-500 outline-none text-white placeholder-gray-400 transition-all duration-200 shadow-sm"
						placeholder="Dia de fechamento (1-31)"
						value={cardCloseDay}
						onChange={e => setCardCloseDay(Number(e.target.value))}
					/>
					<div className="flex justify-between gap-4 mb-2">
						<div className="flex flex-col items-center flex-1">
							<label className="text-xs text-gray-300 mb-1">Cor do fundo</label>
							<input
								type="color"
								value={color}
								onChange={e => setColor(e.target.value)}
								className="w-12 h-12 rounded-full border-2 border-slate-600 shadow-md cursor-pointer bg-transparent"
							/>
						</div>
						<div className="flex flex-col items-center flex-1">
							<label className="text-xs text-gray-300 mb-1">Cor da fonte</label>
							<input
								type="color"
								value={colorFont}
								onChange={e => setColorFont(e.target.value)}
								className="w-12 h-12 rounded-full border-2 border-slate-600 shadow-md cursor-pointer bg-transparent"
							/>
						</div>
					</div>
					<div className="flex justify-end gap-4 mt-4">
						<button className="px-5 py-2 rounded-xl border border-gray-400 hover:bg-gray-100 text-gray-800 bg-white/90 font-semibold transition-all duration-200" type="button" onClick={() => props.closeComponent()} disabled={isLoading}>Cancelar</button>
						<button className="px-5 py-2 rounded-xl text-white font-semibold bg-gradient-to-r from-fuchsia-500 to-sky-500 hover:from-fuchsia-600 hover:to-sky-600 shadow-lg transition-all duration-200" type="submit" disabled={isLoading}>{isLoading ? 'Enviando...' : (isEdit ? 'Salvar' : 'Confirmar')}</button>
					</div>
				</form>
			</div>
		</>
	)
}