import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArchive, FiCalendar, FiEye, FiPrinter, FiRefreshCw, FiTrash2, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import Dialog from '../components/Dialog';
import { API } from '../services/api';
import { logout } from '../services/auth';
import { formatToBRL, formatToBRL_report, formatToNumber } from '../services/amountFormat';
import { categoryOptions } from '../services/categoryOptions';
import { useUser } from '../contexts/UserContext';

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

function formatTransactionSource(source: TransactionSnapshot['source']) {
	const labels: Record<TransactionSnapshot['source'], string> = {
		salary: 'Salário',
		carryover: 'Lazer',
		savings: 'Economias'
	};

	return labels[source] || 'Não informado';
}

const reportErrorTranslations: Record<string, string> = {
	'This cycle is already closed.': 'Este ciclo já foi fechado.',
	'Cycle closure not found.': 'Fechamento de ciclo não encontrado.',
	'User not found.': 'Usuário não encontrado.',
	'Invalid salary value.': 'Valor do salário inválido.',
	'Invalid salary day value.': 'Dia de recebimento inválido.',
	'Internal server error.': 'Erro interno do servidor.'
};

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
							<td className="py-3 pr-3 text-slate-300">{formatTransactionSource(transaction.source)}</td>
							<td className="py-3 pr-3 text-slate-300">{formatDate(transaction.date)}</td>
							<td className="py-3 text-right font-semibold text-white">{formatToBRL(transaction.amount)}</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function ClosureList({ closures, selectedId, isLoading, onSelect }: {
	closures: CycleClosureListItem[];
	selectedId?: string;
	isLoading: boolean;
	onSelect: (id: string) => void;
}) {
	if (!closures.length) {
		return (
			<p className="rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm text-slate-400">
				Nenhum ciclo fechado ainda.
			</p>
		);
	}

	return (
		<div className={isLoading ? 'space-y-2 opacity-70' : 'space-y-2'}>
			{closures.map((closure) => (
				<button
					key={closure.id}
					type="button"
					className={[
						'w-full rounded-xl border p-4 text-left transition',
						selectedId === closure.id
							? 'border-emerald-300/40 bg-gradient-to-br from-emerald-300/[0.12] to-white/[0.025] shadow-[0_16px_40px_-30px_rgba(52,211,153,0.42)]'
							: 'border-white/[0.08] bg-white/[0.025] hover:border-white/15 hover:bg-white/[0.05]'
					].join(' ')}
					onClick={() => onSelect(closure.id)}
				>
					<div className="flex items-start justify-between gap-3">
						<div className="min-w-0">
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
	const [showClosurePicker, setShowClosurePicker] = useState(false);
	const [showCloseCycleDialog, setShowCloseCycleDialog] = useState(false);
	const [cycleSalaryInput, setCycleSalaryInput] = useState('');
	const navigate = useNavigate();
	const { user, isLoadingUser } = useUser();

	document.title = 'Allfinanz | Relatórios';

	useEffect(() => {
		loadClosures();
	}, []);

	useEffect(() => {
		if (!showClosurePicker) return;
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === 'Escape') setShowClosurePicker(false);
		};
		window.addEventListener('keydown', handleKeyDown);
		return () => window.removeEventListener('keydown', handleKeyDown);
	}, [showClosurePicker]);

	async function handleRequestError(error: any, fallbackMessage: string) {
		if (error.response?.status === 401) {
			toast.error('Usuário não autenticado.');
			await logout();
			navigate('/');
			return;
		}

		if (!error.response) {
			toast.error('Não foi possível conectar com o servidor.');
			return;
		}

		const apiMessage = error.response?.data?.message;
		toast.error((apiMessage && reportErrorTranslations[apiMessage]) || apiMessage || fallbackMessage);
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
		const cycleSalary = formatToNumber(cycleSalaryInput);
		if (cycleSalary <= 0) {
			toast.error('Informe o valor recebido neste ciclo.');
			return;
		}

		try {
			setIsClosing(true);
			const res = await API.post('/report/closures', { cycle_salary: cycleSalary }, { withCredentials: true });
			const closure = res.data.closure;
			toast.success('Ciclo fechado com sucesso.');
			setShowCloseCycleDialog(false);
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

	function openCloseCycleDialog() {
		setCycleSalaryInput(formatToBRL(Number(user?.salary) || 0));
		setShowCloseCycleDialog(true);
	}

	function handleCycleSalaryChange(value: string) {
		setCycleSalaryInput(formatToBRL(formatToNumber(value)));
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
		<section className="px-3 pb-24 text-slate-100 sm:px-4 md:px-0">
			<div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between print:hidden">
				<div>
					<p className="text-sm font-medium text-sky-300">Relatórios</p>
					<h1 className="mt-1 text-xl font-semibold text-white sm:text-2xl">Fechamentos de ciclo</h1>
					<p className="mt-2 text-sm text-slate-400">
						Acompanhe os ciclos encerrados e consulte um registro fiel das suas movimentações.
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:border-sky-300/25 hover:bg-sky-300/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
						onClick={loadClosures}
						disabled={isLoading}
					>
						<FiRefreshCw className={isLoading ? 'animate-spin' : ''} />
						Atualizar
					</button>
					<button
						type="button"
						className="inline-flex items-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-[#06251e] shadow-[0_12px_30px_-18px_rgba(52,211,153,0.8)] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60"
						onClick={openCloseCycleDialog}
						disabled={isClosing || isLoadingUser}
					>
						<FiArchive />
						{isClosing ? 'Fechando...' : 'Fechar ciclo atual'}
					</button>
				</div>
			</div>

			{showCloseCycleDialog && (
				<div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm print:hidden">
					<button
						type="button"
						aria-label="Fechar edição do salário do ciclo"
						className="absolute inset-0"
						onClick={() => !isClosing && setShowCloseCycleDialog(false)}
					/>
					<form
						role="dialog"
						aria-modal="true"
						aria-labelledby="cycle-salary-title"
						className="relative z-10 w-full max-w-md rounded-2xl border border-white/[0.08] bg-[#0b1320] p-5 text-slate-200 shadow-[0_32px_100px_-38px_rgba(0,0,0,0.95)] sm:p-6"
						onSubmit={(event) => { event.preventDefault(); closeCurrentCycle(); }}
					>
						<div className="mb-5 flex items-start justify-between gap-3">
							<div>
								<p className="text-xs font-medium uppercase tracking-[0.16em] text-emerald-300">Fechamento do ciclo</p>
								<h2 id="cycle-salary-title" className="mt-1 text-lg font-semibold text-white">Quanto você recebeu?</h2>
							</div>
							<button type="button" aria-label="Fechar" disabled={isClosing} onClick={() => setShowCloseCycleDialog(false)} className="rounded-lg p-2 text-slate-400 transition hover:bg-white/[0.06] hover:text-white disabled:opacity-50">
								<FiX />
							</button>
						</div>
						<p className="text-sm text-slate-400">Informe o valor real recebido neste ciclo. Ele será salvo apenas neste fechamento; o salário do seu perfil não será alterado.</p>
						<label htmlFor="cycleSalary" className="mt-5 block text-xs font-medium uppercase tracking-[0.14em] text-slate-300">Valor recebido</label>
						<div className="relative mt-2">
							<span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-sm text-slate-400">R$</span>
							<input
								autoFocus
								id="cycleSalary"
								type="text"
								inputMode="decimal"
								value={cycleSalaryInput}
								onChange={(event) => handleCycleSalaryChange(event.target.value)}
								className="w-full rounded-xl border border-white/10 bg-white/[0.035] py-3 pl-12 pr-4 text-lg font-semibold text-white focus:border-emerald-300/50 focus:outline-none focus:ring-2 focus:ring-emerald-300/15"
								placeholder="0,00"
							/>
						</div>
						<div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
							<button type="button" onClick={() => setShowCloseCycleDialog(false)} disabled={isClosing} className="rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60">Cancelar</button>
							<button type="submit" disabled={isClosing} className="inline-flex items-center justify-center gap-2 rounded-xl border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-[#06251e] transition hover:bg-emerald-200 disabled:cursor-not-allowed disabled:opacity-60">
								<FiArchive />
								{isClosing ? 'Fechando...' : 'Confirmar fechamento'}
							</button>
						</div>
					</form>
				</div>
			)}

			{closures.length > 0 && (
				<div className="mb-4 xl:hidden print:hidden">
					<button
						type="button"
						className="flex w-full items-center justify-between gap-3 rounded-2xl border border-white/[0.08] bg-[#0b1320]/90 p-4 text-left shadow-[0_18px_50px_-36px_rgba(0,0,0,0.9)]"
						onClick={() => setShowClosurePicker(true)}
					>
						<span className="flex min-w-0 items-center gap-3">
							<FiCalendar className="shrink-0 text-slate-400" />
							<span className="min-w-0">
								<span className="block text-xs uppercase text-slate-500">Fechamento selecionado</span>
								<span className="mt-1 block truncate text-sm font-semibold text-white">
									{selectedClosure
									? `${formatDate(selectedClosure.cycleStart)} até ${formatDate(selectedClosure.cycleEnd)}`
									: 'Escolha um ciclo'}
								</span>
							</span>
						</span>
						<span className="shrink-0 rounded-full border border-emerald-300/20 bg-emerald-300/[0.08] px-3 py-1.5 text-xs font-semibold text-emerald-200">Trocar</span>
					</button>
				</div>
			)}

			{showClosurePicker && (
				<div className="fixed inset-0 z-[60] print:hidden xl:hidden">
					<button
						type="button"
						aria-label="Fechar lista de fechamentos"
						className="absolute inset-0 bg-black/70"
						onClick={() => setShowClosurePicker(false)}
					/>
					<div role="dialog" aria-modal="true" aria-labelledby="closure-picker-title" className="relative z-10 h-[100dvh] w-full overscroll-contain overflow-y-auto bg-[#070d18] px-4 py-5 text-slate-100">
						<div className="mb-5 flex items-start justify-between gap-3 border-b border-white/10 pb-4">
							<div>
								<h2 id="closure-picker-title" className="text-base font-semibold text-white">Todos os fechamentos</h2>
								<p className="mt-1 text-sm text-slate-400">Selecione o ciclo que deseja consultar.</p>
							</div>
							<button type="button" aria-label="Fechar lista de fechamentos" className="rounded-lg p-2 text-slate-400 hover:bg-white/[0.08] hover:text-white" onClick={() => setShowClosurePicker(false)}>
								<FiX />
							</button>
						</div>
						<ClosureList
							closures={closures}
							selectedId={selectedClosure?.id}
							isLoading={isLoading}
							onSelect={(id) => { setShowClosurePicker(false); loadClosure(id); }}
						/>
					</div>
				</div>
			)}

			<div className="grid min-w-0 gap-4 xl:grid-cols-[420px_minmax(0,1fr)]">
				<aside className="hidden rounded-2xl border border-white/[0.08] bg-[#0b1320]/80 p-4 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] print:hidden xl:block">
					<div className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
						<FiCalendar className="text-slate-400" />
						Todos os fechamentos
					</div>
					<ClosureList
						closures={closures}
						selectedId={selectedClosure?.id}
						isLoading={isLoading}
						onSelect={loadClosure}
					/>
				</aside>

				<article className="min-w-0 rounded-2xl border border-white/[0.08] bg-[#0b1320]/80 p-4 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] sm:p-5 print:border-0 print:bg-white print:p-0 print:text-slate-950 print:shadow-none">
					{selectedClosure ? (
						<div>
							<div className="mb-5 flex flex-col gap-3 border-b border-white/10 pb-5 print:border-slate-300">
								<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
									<div>
										<p className="inline-flex items-center gap-2 text-sm font-medium text-emerald-300 print:text-slate-600"><span className="h-2 w-2 rounded-full bg-emerald-300 print:hidden" />Ciclo encerrado</p>
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
											className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] print:hidden"
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
												className="inline-flex items-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-60 print:hidden"
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
								<div className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-emerald-300/[0.11] to-white/[0.025] p-4 print:border-slate-300 print:bg-white">
									<p className="text-xs uppercase text-slate-500">Salário</p>
									<p className="mt-2 text-lg font-semibold text-white print:text-slate-950">{formatToBRL_report(selectedClosure.salarySnapshot)}</p>
								</div>
								<div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 print:border-slate-300 print:bg-white">
									<p className="text-xs uppercase text-slate-500">Fixos congelados</p>
									<p className="mt-2 text-lg font-semibold text-white print:text-slate-950">{formatToBRL_report(selectedClosure.totals.fixed)}</p>
								</div>
								<div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 print:border-slate-300 print:bg-white">
									<p className="text-xs uppercase text-slate-500">Variáveis</p>
									<p className="mt-2 text-lg font-semibold text-white print:text-slate-950">{formatToBRL_report(selectedClosure.totals.variable)}</p>
								</div>
								<div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4 print:border-slate-300 print:bg-white">
									<p className="text-xs uppercase text-slate-500">Saldo</p>
									<p className="mt-2 text-lg font-semibold text-white print:text-slate-950">{formatToBRL_report(selectedClosure.totals.salaryBalance)}</p>
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
						<div className="flex min-h-[240px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-8 text-center print:hidden sm:min-h-[420px]">
							<div>
								<FiArchive className="mx-auto h-8 w-8 text-slate-500" />
								<p className="mt-3 text-sm font-semibold text-white">{closures.length ? 'Selecione um fechamento' : 'Nenhum ciclo fechado ainda'}</p>
								<p className="mt-1 text-sm text-slate-400">
									{closures.length ? 'Os ciclos salvos aparecem no seletor acima.' : 'Feche um ciclo para começar o histórico.'}
								</p>
							</div>
						</div>
					)}
				</article>
			</div>
		</section>
	);
}
