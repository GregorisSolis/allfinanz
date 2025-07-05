	import { useState, useEffect } from "react";
	import { formatToBRL } from "../services/amountFormat";
	import { typePayOptions } from "../services/typePayOptions";
	import { categoryOptions } from "../services/categoryOptions";
	import { FiEdit, FiTrash2, FiMoreVertical } from "react-icons/fi";
	import { API } from '../services/api'
	import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { useTransaction } from "../contexts/TransactionContext";

	interface FixedCostItem {
		_id: string
		description: string
		category: number
		type: number
		amount: number
	}

	interface ListFixedCostProps {
		list: FixedCostItem[]
		title: string
		reload: () => void
	}

	export function TableListTransaction(props: ListFixedCostProps) {
		
		const { list, reload, title } = props;
		const [selected, setSelected] = useState<string[]>([]);
		const [openMenuId, setOpenMenuId] = useState<string | null>(null);
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

		// Verificar se la lista está vacía o no es un array
		if (!Array.isArray(list) || list.length === 0) {
			return (
				<div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg w-full">
					<h2 className="text-xl mb-4 font-thin">{title}</h2>
					<div className="text-center py-8">
						<p className="text-gray-400 mb-4">Nenhuma transação encontrada</p>
					</div>
				</div>
			)
		}

		const removeTransaction = async (id: string) => {
			try {
				await API.delete(`/transaction/${id}`, {withCredentials: true})
				toast.success("Transação removida com sucesso.")
				reload()
			} catch (error) {
				toast.error("Erro ao remover a transação.")
			}
		}

		return (
			<div className="mx-2 bg-slate-800 text-white p-6 rounded-xl shadow-lg w-full">

				<div className="flex justify-between items-center mb-4">
					<h2 className="text-xl font-thin">{title}</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="table-auto w-full border-collapse">
						<thead>
							<tr className="">
								<th className="p-3">#</th>
								<th className="p-3 text-left">Descripção</th>
								<th className="p-3 text-left">Tipo</th>
								<th className="p-3 text-left">Categoria</th>
								<th className="p-3 text-center">Valor</th>
								<th className="p-3 text-center">Ações</th>
							</tr>
						</thead>
						<tbody>
							{list.map((item, index) => (
								<tr key={item._id || index} >
									<td className="p-3 text-center">
										<input
											type="checkbox"
											checked={selected.includes(item._id)}
											onChange={() => toggleSelect(item._id)}
											className="h-4 w-4 cursor-pointer appearance-none rounded-sm border border-gray-600 bg-transparent checked:border-transparent checked:bg-slate-500 checked:bg-center checked:bg-no-repeat"
										/>
									</td>
									<td className="p-3">{item.description || 'N/A'}</td>
									<td className="p-3">{typePayOptions[item.type]?.name || 'N/A'}</td>
									<td className="p-3">{categoryOptions[item.category]?.name || 'N/A'}</td>
									<td className="p-3 text-center">{formatToBRL(item.amount || 0)}</td>
									<td className="p-3 text-center relative">
										<button
											onClick={(e) => {
												e.stopPropagation();  // <-- Importante: evita burbujas innecesarias
												setOpenMenuId(openMenuId === item._id ? null : item._id);
											}}
											className="text-gray-400 hover:text-white p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500"
										>
											<span className="pointer-events-none">
												<FiMoreVertical size={18} />
											</span>
										</button>

										{openMenuId === item._id && (
											<div
												className="absolute right-8 top-0 mt-2 w-40 bg-slate-900 border border-slate-700 rounded-md shadow-lg z-20"
												onMouseLeave={() => setOpenMenuId(null)}
											>
												<ul className="py-1">
													<li>
														<Link to={"/gasto/"+item._id}
															className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-slate-800 flex items-center"
															title="Editar"
														>
															<FiEdit size={16} className="mr-3" />
															Editar
														</Link>
													</li>
													<li>
														<button
															className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-slate-800 flex items-center"
															title="Remover"
															onClick={() => removeTransaction(item._id)}
														>
															<FiTrash2 size={16} className="mr-3" />
															Remover
														</button>
													</li>
												</ul>
											</div>
										)}
									</td>
								</tr>
							))}
						</tbody>
						<tfoot>
							<tr className="font-semibold">
								<td colSpan={5} className="p-3 text-right">
									Total {selected.length > 0 ? '(Seleccionados)' : ''}
								</td>
								<td className="p-3 text-center text-3xl font-thin">{formatToBRL(total)}</td>
							</tr>
						</tfoot>
					</table>
				</div>
				{selected.length > 0 && (
					<div className="mt-4 p-3 bg-slate-800 rounded-lg">
						<p className="text-sm text-gray-300">
							{selected.length} elemento(s) seleccionado(s)
						</p>
					</div>
				)}
			</div>
		)
	}