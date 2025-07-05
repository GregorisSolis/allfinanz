import { useTransaction } from '../contexts/TransactionContext'
import { formatToBRL } from '../services/amountFormat'

export function TransactionTotals() {
	const { totals } = useTransaction();

	const selectedTotal = totals.selectedFixedTotal + totals.selectedRelativeTotal;

	// Se não há itens selecionados, não mostra nada
	if (selectedTotal <= 0) {
		return null;
	}

	return (
		<div className="fixed bottom-4 right-4 z-50">
			<div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-2xl">
				<h3 className="text-lg text-gray-400 mb-2 text-center">Total Selecionado</h3>
				<p className="text-3xl font-bold text-green-400 text-center">
					{formatToBRL(selectedTotal)}
				</p>
			</div>
		</div>
	)
} 