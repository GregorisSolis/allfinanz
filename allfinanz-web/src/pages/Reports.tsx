import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArchive, FiCalendar, FiEye, FiPrinter, FiRefreshCw, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Dialog from '../components/Dialog';
import { API } from '../services/api';
import { logout } from '../services/auth';
import { formatToBRL_report } from '../services/amountFormat';
import { categoryOptions } from '../services/categoryOptions';

type TransactionSnapshot = {
	originalTransactionId?: string;
	amount: number;
	description: string;
	category: string;
	type?: string;
	date?: string;
	fixed: boolean;
	source: 'salary' | 'carryover' | 'savings';
};

type ClosureTotals = {
	fixed: number;
	variable: number;
	total: number;
	salaryBalance: number;
	dailyLimit: number;
	carryoverSpent: number;
	carryoverAvailable: number;
	savingsSpent: number;
};

type CycleClosureListItem = {
	id: string;
	cycleStart: string;
	cycleEnd: string;
	salaryDaySnapshot: number;
	salarySnapshot: number;
	totals: ClosureTotals;
	closedAt: string;
};

type CycleClosure = CycleClosureListItem & {
	_id: string;
	fixedTransactionsSnapshot: TransactionSnapshot[];
	variableTransactionsSnapshot: TransactionSnapshot[];
};

function formatDate(value?: string) {
	if (!value) return '--';
	return new Intl.DateTimeFormat('pt-BR', { timeZone: 'UTC' }).format(new Date(value));
}

function formatDateTime(value?: string) {
	if (!value) return '--';
	return new Intl.DateTimeFormat('pt-BR', {
		dateStyle: 'short',
		timeStyle: 'short'
	}).format(new Date(value));
}

const EMOJI_REGEX = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{200D}\u{FE0F}\u{20E3}]/gu;

function stripEmojis(text: string) {
	return text.replace(EMOJI_REGEX, '').replace(/\s{2,}/g, ' ').trim();
}

function TransactionRows({ transactions }: { transactions: TransactionSnapshot[] }) {
	if (!transactions.length) {
		return <p className="py-4 text-sm text-slate-500">Nenhuma transação neste grupo.</p>;
	}

	return (
		<div className="overflow-x-auto">
			<table className="w-full min-w-[680px] text-left text-sm print:text-xs print:leading-relaxed">
				<thead className="border-b border-white/10 text-xs uppercase text-slate-500">
					<tr>
						<th className="py-3 pr-3 font-medium">Descrição</th>
						<th className="py-3 pr-3 font-medium">Categoria</th>
						<th className="py-3 pr-3 font-medium">Origem</th>
						<th className="py-3 pr-3 font-medium">Data</th>
						<th className="py-3 text-right font-medium">Valor</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-white/10">
					{transactions.map((transaction, index) => (
						<tr key={`${transaction.originalTransactionId || transaction.description}-${index}`}>
							<td className="py-3 pr-3 text-slate-100">
								<span className="print:hidden">{transaction.description}</span>
								<span className="hidden print:inline">{stripEmojis(transaction.description)}</span>
							</td>
							<td className="py-3 pr-3 text-slate-300">{categoryOptions[Number(transaction.category)]?.name || transaction.category || 'N/A'}</td>
							<td className="py-3 pr-3 text-slate-300">{transaction.source}</td>
							<td className="py-3 pr-3 text-slate-300">{formatDate(transaction.date)}</td>
							<td className="py-3 text-right font-semibold text-white">{formatToBRL_report(transaction.amount)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export function Reports() {
	const [closures, setClosures] = useState<CycleClosureListItem[]>([]);
	const [selectedClosure, setSelectedClosure] = useState<CycleClosure | null>(null);
	const [isLoading, setIsLoading] = useState(false);
	const [isClosing, setIsClosing] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const navigate = useNavigate();

	document.title = 'Allfinanz | Relatórios';

	useEffect(() => {
		loadClosures();
	}, []);

	async function handleRequestError(error: any, fallbackMessage: string) {
		if (error.response?.status === 401) {
			toast.error('Usuario não autenticado.');
			await logout();
			navigate('/');
			return;
		}

		if (!error.response) {
			toast.error('Não foi possível conectar com o servidor.');
			return;
		}

		toast.error(error.response?.data?.message || fallbackMessage);
	}

	async function loadClosures() {
		try {
			setIsLoading(true);
			const res = await API.get('/report/closures', { withCredentials: true });
			const nextClosures = res.data.closures || [];
			setClosures(nextClosures);

			if (!selectedClosure && nextClosures.length) {
				await loadClosure(nextClosures[0].id);
			}
		} catch (error: any) {
			await handleRequestError(error, 'Erro ao carregar fechamentos.');
		} finally {
			setIsLoading(false);
		}
	}

	async function loadClosure(id: string) {
		try {
			setIsLoading(true);
			const res = await API.get(`/report/closures/${id}`, { withCredentials: true });
			const closure = res.data.closure;
			setSelectedClosure({
				...closure,
				id: closure._id
			});
		} catch (error: any) {
			await handleRequestError(error, 'Erro ao carregar fechamento.');
		} finally {
			setIsLoading(false);
		}
	}

	async function closeCurrentCycle() {
		try {
			setIsClosing(true);
			const res = await API.post('/report/closures', {}, { withCredentials: true });
			const closure = res.data.closure;
			toast.success('Ciclo fechado com sucesso.');
			await loadClosures();
			setSelectedClosure({
				...closure,
				id: closure._id
			});
		} catch (error: any) {
			await handleRequestError(error, 'Erro ao fechar ciclo.');
		} finally {
			setIsClosing(false);
		}
	}

	function printClosure() {
		window.print();
	}

	async function removeClosure() {
		if (!selectedClosure) return;

		try {
			setIsDeleting(true);
			await API.delete(`/report/closures/${selectedClosure.id}`, { withCredentials: true });
			toast.success('Relatório removido com sucesso.');
			setSelectedClosure(null);
			await loadClosures();
		} catch (error: any) {
			await handleRequestError(error, 'Erro ao remover relatório.');
		} finally {
			setIsDeleting(false);
		}
	}

	return (
		<section className="pb-24 text-slate-100">
			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between print:hidden">
				<div>
					<p className="text-sm font-medium text-slate-400">Relatórios</p>
					<h1 className="mt-1 text-2xl font-semibold text-white">Fechamentos de ciclo</h1>
					<p className="mt-2 text-sm text-slate-400">
						Consulte todos os ciclos fechados e imprima o histórico congelado.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-60"
						onClick={loadClosures}
						disabled={isLoading}
					>
						<FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
						Atualizar
					</button>
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
						onClick={closeCurrentCycle}
						disabled={isClosing}
					>
						<FiArchive />
						{isClosing ? 'Fechando...' : 'Fechar ciclo atual'}
					</button>
				</div>
			</div>

			<div className="grid gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
				<aside className="rounded-lg border border-white/10 bg-[#0d1117] p-4 print:hidden">
					<div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
						<FiCalendar className="text-slate-400" />
						Todos os fechamentos
					</div>

					<div className={isLoading ? 'space-y-2 opacity-70' : 'space-y-2'}>
						{closures.map((closure) => (
							<button
								key={closure.id}
								type="button"
								className={[
									'w-full rounded-lg border p-3 text-left transition',
									selectedClosure?.id === closure.id
										? 'border-emerald-300/40 bg-emerald-300/10'
										: 'border-white/10 bg-white/[0.03] hover:bg-white/[0.06]'
								].join(' ')}
								onClick={() => loadClosure(closure.id)}
							>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-sm font-semibold text-white">
											{formatDate(closure.cycleStart)} até {formatDate(closure.cycleEnd)}
										</p>
										<p className="mt-1 text-xs text-slate-500">
											Fechado em {formatDateTime(closure.closedAt)}
										</p>
									</div>
									<FiEye className="mt-1 shrink-0 text-slate-400" />
								</div>
								<div className="mt-3 grid grid-cols-2 gap-2 text-xs">
									<span className="text-slate-500">Fixos</span>
									<span className="text-right font-semibold text-slate-200">{formatToBRL_report(closure.totals.fixed)}</span>
									<span className="text-slate-500">Total</span>
									<span className="text-right font-semibold text-slate-200">{formatToBRL_report(closure.totals.total)}</span>
								</div>
							</button>
						))}

						{!closures.length && (
							<p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
								Nenhum ciclo fechado ainda.
							</p>
						)}
					</div>
				</aside>

				<main className="rounded-lg border border-white/10 bg-[#0d1117] p-5 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] print:border-0 print:bg-white print:p-0 print:text-slate-950 print:shadow-none">
					{selectedClosure ? (
						<div>
							<div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 print:border-slate-300">
								<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<p className="text-sm font-medium text-slate-400 print:text-slate-600">Fechamento de ciclo</p>
										<h2 className="mt-1 text-xl font-semibold text-white print:text-slate-950">
											{formatDate(selectedClosure.cycleStart)} até {formatDate(selectedClosure.cycleEnd)}
										</h2>
										<p className="mt-2 text-sm text-slate-400 print:text-slate-600">
											Dia do salário usado: {selectedClosure.salaryDaySnapshot} | Fechado em {formatDateTime(selectedClosure.closedAt)}
										</p>
									</div>
									<div className="flex w-fit flex-wrap gap-2">
										<button
											type="button"
											className="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] print:hidden"
											onClick={printClosure}
										>
											<FiPrinter />
											Imprimir
										</button>
										<Dialog
											title="Remover relatório?"
											description={`Tem certeza que deseja remover o relatório de ${formatDate(selectedClosure.cycleStart)} até ${formatDate(selectedClosure.cycleEnd)}? Essa ação não pode ser desfeita.`}
											open={showDeleteDialog}
											onOpenChange={setShowDeleteDialog}
											onConfirm={() => { setShowDeleteDialog(false); removeClosure(); }}
											onCancel={() => setShowDeleteDialog(false)}
											confirmText="Remover"
											cancelText="Cancelar"
											confirmVariant="destructive"
										>
											<button
												type="button"
												className="inline-flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 print:hidden"
												onClick={() => setShowDeleteDialog(true)}
												disabled={isDeleting}
											>
												<FiTrash2 />
												{isDeleting ? 'Removendo...' : 'Remover'}
											</button>
										</Dialog>
									</div>
								</div>
							</div>

							<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
								<div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 print:border-slate-300 print:bg-white">
									<p className="text-xs uppercase text-slate-500">Salário</p>
									<p className="mt-1 text-lg font-semibold text-white print:text-slate-950">{formatToBRL_report(selectedClosure.salarySnapshot)}</p>
								</div>
								<div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 print:border-slate-300 print:bg-white">
									<p className="text-xs uppercase text-slate-500">Fixos congelados</p>
									<p className="mt-1 text-lg font-semibold text-white print:text-slate-950">{formatToBRL_report(selectedClosure.totals.fixed)}</p>
								</div>
								<div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 print:border-slate-300 print:bg-white">
									<p className="text-xs uppercase text-slate-500">Variáveis</p>
									<p className="mt-1 text-lg font-semibold text-white print:text-slate-950">{formatToBRL_report(selectedClosure.totals.variable)}</p>
								</div>
								<div className="rounded-lg border border-white/10 bg-white/[0.03] p-3 print:border-slate-300 print:bg-white">
									<p className="text-xs uppercase text-slate-500">Saldo</p>
									<p className="mt-1 text-lg font-semibold text-white print:text-slate-950">{formatToBRL_report(selectedClosure.totals.salaryBalance)}</p>
								</div>
							</div>

							<section className="mt-6">
								<h3 className="text-base font-semibold text-white print:text-slate-950">Gastos fixos congelados</h3>
								<TransactionRows transactions={selectedClosure.fixedTransactionsSnapshot || []} />
							</section>

							<section className="mt-6">
								<h3 className="text-base font-semibold text-white print:text-slate-950">Gastos variáveis do ciclo</h3>
								<TransactionRows transactions={selectedClosure.variableTransactionsSnapshot || []} />
							</section>
						</div>
					) : (
						<div className="flex min-h-[420px] items-center justify-center rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-8 text-center print:hidden">
							<div>
								<FiArchive className="mx-auto h-8 w-8 text-slate-500" />
								<p className="mt-3 text-sm font-semibold text-white">Selecione um fechamento</p>
								<p className="mt-1 text-sm text-slate-400">
									Todos os ciclos salvos aparecem na lista ao lado.
								</p>
							</div>
						</div>
					)}
				</main>
			</div>
		</section>
	);
}
