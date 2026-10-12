	import { useState, useEffect } from "react";
	import { formatToBRL } from "../services/amountFormat";
	import { typePayOptions } from "../services/typePayOptions";
	import { categoryOptions } from "../services/categoryOptions";
import { useNavigate } from "react-router-dom";
import { useTransaction } from "../contexts/TransactionContext";

	interface FixedCostItem {
		_id: string
		description: string
		category: number
		type: number
		amount: number
		card?: string
	}

	interface CardItem {
		_id: string
		name: string
	}

	interface ListFixedCostProps {
		list: FixedCostItem[]
		title: string
		cards?: CardItem[]
	}

	export function TableListTransaction(props: ListFixedCostProps) {

		const { list, title, cards = [] } = props;
		const navigate = useNavigate();
		const [selected, setSelected] = useState<string[]>([]);
		const { updateFixedTotal, updateRelativeTotal, updateSelectedFixedTotal, updateSelectedRelativeTotal } = useTransaction();

		const toggleSelect = (id: string) => {
			setSelected((prev) =>
				prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
			)
		}

		// Atualizar totais no contexto quando a lista ou seleção mudar
		useEffect(() => {
			if (!Array.isArray(list)) return;
			
			const total = list.reduce((sum, item) => sum + (item.amount || 0), 0);
			const selectedTotal = selected.length > 0 
				? list.filter(item => selected.includes(item._id)).reduce((sum, item) => sum + (item.amount || 0), 0)
				: 0;
			
			// Determinar se é uma lista de gastos fixos ou relativos baseado no título
			if (title.toLowerCase().includes('fixo')) {
				updateFixedTotal(total);
				updateSelectedFixedTotal(selectedTotal);
			} else {
				updateRelativeTotal(total);
				updateSelectedRelativeTotal(selectedTotal);
			}
		}, [list, selected, title, updateFixedTotal, updateRelativeTotal, updateSelectedFixedTotal, updateSelectedRelativeTotal]);

		// Calcular total de los items seleccionados o todos si no hay selección
		const calculateTotal = () => {
			if (!Array.isArray(list)) return 0
			
			const itemsToSum = selected.length > 0 
				? list.filter(item => selected.includes(item._id))
				: list
				
			return itemsToSum.reduce((total, item) => total + (item.amount || 0), 0)
		}

		const total = calculateTotal()

		const getCardName = (cardId?: string) => {
			if (!cardId) return '--'

			return cards.find(card => card._id === cardId)?.name || '--'
		}

		const openTransaction = (id: string) => navigate(`/gasto/${id}`);

		// Verificar se la lista está vacía o no es un array
		if (!Array.isArray(list) || list.length === 0) {
			return (
				<div className="w-full rounded-2xl border border-white/[0.08] bg-[#0b1320] p-6 text-slate-200 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
					<h2 className="text-sm mb-4 font-semibold text-white">{title}</h2>
					<div className="text-center py-8">
						<p className="text-slate-400 mb-4">Nenhuma transação encontrada</p>
					</div>
				</div>
			)
		}

		return (
			<div className="w-full rounded-2xl border border-white/[0.08] bg-[#0b1320] p-3 text-slate-200 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] sm:p-4">

				<div className="flex justify-between items-center mb-4">
					<h2 className="text-sm font-semibold text-white">{title}</h2>
				</div>
				<div className="space-y-3 md:hidden">
					{list.map((item, index) => (
						<div
							key={item._id || index}
							role="link"
							tabIndex={0}
							onClick={() => openTransaction(item._id)}
							onKeyDown={event => {
								if (event.target === event.currentTarget && event.key === 'Enter') openTransaction(item._id);
							}}
							className="cursor-pointer rounded-xl border border-white/[0.08] bg-white/[0.025] p-3 transition hover:border-sky-300/20 hover:bg-white/[0.04]"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="flex min-w-0 flex-1 items-start gap-3">
									<input
										type="checkbox"
										checked={selected.includes(item._id)}
										onChange={() => toggleSelect(item._id)}
										onClick={event => event.stopPropagation()}
										className="mt-1 h-4 w-4 shrink-0 cursor-pointer appearance-none rounded-sm border border-white/20 bg-transparent checked:border-sky-300 checked:bg-sky-300 checked:bg-center checked:bg-no-repeat"
									/>
									<span className="min-w-0">
										<span className="block break-words text-sm font-semibold text-white">{item.description || 'N/A'}</span>
										<span className="mt-1 block text-xs text-slate-400">{typePayOptions[item.type]?.name || 'N/A'} · {categoryOptions[item.category]?.name || 'N/A'}</span>
									</span>
								</div>

							</div>

							<div className="mt-3 grid grid-cols-2 gap-2 text-xs">
								<div className="rounded-xl bg-white/[0.04] p-2">
									<p className="uppercase text-slate-500">Cartão</p>
									<p className="mt-1 truncate font-medium text-slate-200">{getCardName(item.card)}</p>
								</div>
								<div className="rounded-xl bg-white/[0.04] p-2 text-right">
									<p className="uppercase text-slate-500">Valor</p>
									<p className="mt-1 font-semibold text-white">{formatToBRL(item.amount || 0)}</p>
								</div>
							</div>
						</div>
					))}

					<div className="rounded-xl border border-white/[0.08] bg-white/[0.04] p-3 text-right">
						<p className="text-xs uppercase text-slate-500">Total {selected.length > 0 ? '(selecionados)' : ''}</p>
						<p className="mt-1 text-xl font-semibold text-white">{formatToBRL(total)}</p>
					</div>
				</div>
				<div className="hidden overflow-x-auto md:block">
					<table className="table-auto w-full border-collapse">
						<thead>
							<tr className="">
								<th className="p-3 text-xs uppercase text-slate-500">#</th>
								<th className="p-3 text-left text-xs uppercase text-slate-500">Descripção</th>
								<th className="p-3 text-left text-xs uppercase text-slate-500">Tipo</th>
								<th className="p-3 text-left text-xs uppercase text-slate-500">Categoria</th>
								<th className="p-3 text-left text-xs uppercase text-slate-500">Cartão</th>
								<th className="p-3 text-center text-xs uppercase text-slate-500">Valor</th>
							</tr>
						</thead>
						<tbody>
							{list.map((item, index) => (
								<tr
									key={item._id || index}
									role="link"
									tabIndex={0}
									onClick={() => openTransaction(item._id)}
									onKeyDown={event => {
										if (event.target === event.currentTarget && event.key === 'Enter') openTransaction(item._id);
									}}
									className="cursor-pointer border-t border-white/10 transition hover:bg-white/[0.035] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-sky-300"
								>
									<td className="p-3 text-center">
										<input
											type="checkbox"
											checked={selected.includes(item._id)}
											onChange={() => toggleSelect(item._id)}
											onClick={event => event.stopPropagation()}
											className="h-4 w-4 cursor-pointer appearance-none rounded-sm border border-white/20 bg-transparent checked:border-sky-300 checked:bg-sky-300 checked:bg-center checked:bg-no-repeat"
										/>
									</td>
									<td className="p-3">{item.description || 'N/A'}</td>
									<td className="p-3">{typePayOptions[item.type]?.name || 'N/A'}</td>
									<td className="p-3">{categoryOptions[item.category]?.name || 'N/A'}</td>
									<td className="p-3">{getCardName(item.card)}</td>
									<td className="p-3 text-center">{formatToBRL(item.amount || 0)}</td>
									
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr className="font-semibold">
								<td colSpan={5} className="p-3 text-right">
									Total {selected.length > 0 ? '(Seleccionados)' : ''}
								</td>
								<td className="p-3 text-center text-2xl font-semibold text-white">{formatToBRL(total)}</td>
							</tr>
						</tfoot>
					</table>
				</div>
				{selected.length > 0 && (
							<div className="mt-4 rounded-xl border border-sky-300/15 bg-sky-300/[0.06] p-3">
						<p className="text-sm text-slate-300">
							{selected.length} elemento(s) seleccionado(s)
						</p>
					</div>
				)}
			</div>
		)
	}
