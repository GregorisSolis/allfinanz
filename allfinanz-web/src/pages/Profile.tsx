import { useEffect, useState } from 'react'
import { ResetPassword } from "../components/ResetPassword"
import { UpdatePhoto } from "../components/UpdatePhoto"
import { API } from '../services/api'
import { toast } from 'react-toastify'
import { FiCamera, FiCheck, FiEdit3, FiLock, FiMail, FiUser, FiX } from 'react-icons/fi'

import imgNotFound from '../assets/imgNotFound.jpg'
import { formatToBRL, formatToNumber } from '../services/amountFormat'
import { useUser } from '../contexts/UserContext'


export function Profile() {
	const { reloadUser } = useUser()

	useEffect(() => {
		loadUser()
	}, [])

	document.title = 'Allfinanz | Perfil'
	let [name, setName] = useState('')
	let [savings, setSavings] = useState(0)
	let [salary, setSalary] = useState(0)
	let [email, setEmail] = useState('')
	let [isUpdateFoto, setIsUpdateFoto] = useState(false)
	let [isUpdatePass, setIsUpdatePass] = useState(false)
	let [imageUrl, setImageUrl] = useState(imgNotFound)
	let [imageID, setImageID] = useState('')
	let [isEditIncomeSavings, setIsEditIncomeSavings] = useState(false)
	let [editSalary, setEditSalary] = useState(formatToBRL(salary))
	let [editSavings, setEditSavings] = useState(formatToBRL(savings))
	let [isLoadingEdit, setIsLoadingEdit] = useState(false)
	let [salaryDay, setSalaryDay] = useState('');

	async function loadUser() {
		await API.get('/user/info-user', { withCredentials: true })
			.then(resp => {
				if (resp.data && resp.data.user) {
					const user = resp.data.user;
					setName(user.name || '');
					setEmail(user.email || '');
					setSavings(user.savings);
					setSalary(user.salary);
					setSalaryDay(user.salary_day || '');
					if (user.imageUrl) setImageUrl(user.imageUrl);
					if (user.imageID) setImageID(user.imageID);
				}
			})
			.catch((err) => {
				toast.error("Erro ao carregar informações do usuário. Tente novamente mais tarde.");
			})
	}

	// Funções para formatar os campos como BRL enquanto o usuário digita
	function handleChangeSalary(e: React.ChangeEvent<HTMLInputElement>) {
		const raw = e.target.value.replace(/\D/g, ''); // Solo números
		const numeric = Number(raw);
		setEditSalary(formatToBRL(numeric));
	}

	function handleChangeSavings(e: React.ChangeEvent<HTMLInputElement>) {
		const raw = e.target.value.replace(/\D/g, ''); // Solo números
		const numeric = Number(raw);
		setEditSavings(formatToBRL(numeric));
	}

	async function handleEditIncomeSavings() {
		if (!isEditIncomeSavings) {
			setIsEditIncomeSavings(true)
			setEditSalary(formatToBRL(salary))
			setEditSavings(formatToBRL(savings))
			return;
		}
		setIsLoadingEdit(true)
		try {
			await API.put("/user/edit", {
				salary: formatToNumber(editSalary),
				savings: formatToNumber(editSavings),
				salary_day: salaryDay
			}, { withCredentials: true })
			toast.success("Usuário atualizado com sucesso!")
			setSalary(formatToNumber(editSalary));
			setSavings(formatToNumber(editSavings));
			await loadUser()
			await reloadUser()
			setIsEditIncomeSavings(false)
		} catch (error: any) {
			if (error.response && error.response.status === 401) {
				toast.error("Usuário não autenticado.")
			} else {
				toast.error("Erro ao atualizar usuário.")
			}
		} finally {
			setIsLoadingEdit(false)
		}
	}

	function handleCancelEdit() {
		setIsEditIncomeSavings(false)
		setEditSalary(formatToBRL(salary))
		setEditSavings(formatToBRL(savings))
	}

	return (
		<>

			{isUpdateFoto ?
				<UpdatePhoto
					closeComponent={() => setIsUpdateFoto(false)}
					reload={() => loadUser()}
					idForRemove={imageID}
				/>
				: null}

			{isUpdatePass ?
				<ResetPassword
					closeComponent={() => setIsUpdatePass(false)}
					reload={() => loadUser()}
				/>
				: null}

			<section className="w-full pb-24 text-slate-100">
				<div className="mb-6 flex flex-col gap-1">
					<p className="text-sm font-medium text-slate-400">Perfil</p>
					<h1 className="text-2xl font-semibold text-white">Conta e configurações</h1>
					<p className="text-sm text-slate-400">
						Mantenha seus dados financeiros e preferências da conta atualizados.
					</p>
				</div>

				<div className="grid gap-4 xl:grid-cols-[340px_1fr]">
					<aside className="rounded-lg border border-white/10 bg-[#0d1117] p-5 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
						<div className="flex flex-col items-center text-center">
							<button
								type="button"
								onClick={() => setIsUpdateFoto(true)}
								className="group relative h-32 w-32 overflow-hidden rounded-full border border-white/10 bg-white/[0.04] transition hover:border-emerald-300/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
								aria-label="Atualizar foto de perfil"
							>
								<img className="h-full w-full object-cover" src={imageUrl} alt="foto de perfil" />
								<span className="absolute inset-0 flex items-center justify-center bg-black/45 text-white opacity-0 transition group-hover:opacity-100">
									<FiCamera size={22} />
								</span>
							</button>
							<h2 className="mt-4 text-xl font-semibold text-white">{name || 'Usuário'}</h2>
							<p className="mt-1 break-all text-sm text-slate-400">{email || 'Email não informado'}</p>
							<button
								type="button"
								onClick={() => setIsUpdatePass(true)}
								className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.08] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
							>
								<FiLock />
								Alterar senha
							</button>
						</div>
					</aside>

					<div className="space-y-4">
						<form className="rounded-lg border border-white/10 bg-[#0d1117] p-4 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)]">
							<div className="mb-5 flex flex-col gap-1">
								<h2 className="text-sm font-semibold text-white">Dados financeiros</h2>
								<p className="text-sm text-slate-400">Esses valores alimentam os cálculos do dashboard e do extrato.</p>
							</div>
							<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
								<div className="flex flex-col">
									<label className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor="profileEmail">Email</label>
									<div className="relative">
										<div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
											<FiMail size={16} />
										</div>
										<input id="profileEmail" type="text" value={email} disabled className="w-full rounded-lg border border-slate-700 bg-white/[0.03] px-4 py-2.5 pl-10 text-sm text-slate-400 focus:outline-none" />
									</div>
								</div>
								<div className="flex flex-col">
									<label className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor="profileSalary">Renda mensal</label>
									<input
										id="profileSalary"
										type="text"
										value={isEditIncomeSavings ? editSalary : formatToBRL(salary)}
										disabled={!isEditIncomeSavings}
										onChange={handleChangeSalary}
										className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 text-sm text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:text-slate-400" />
								</div>
								<div className="flex flex-col">
									<label className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor="salaryDay">Dia do salário</label>
									<input
										id="salaryDay"
										type="number"
										min="1"
										max="31"
										value={salaryDay}
										disabled={!isEditIncomeSavings}
										onChange={e => setSalaryDay(e.target.value)}
										className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 text-sm text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:text-slate-400" />
								</div>
								<div className="flex flex-col">
									<label className="mb-2 text-xs uppercase tracking-[0.2em] text-slate-300" htmlFor="profileSavings">Reservas</label>
									<input
										id="profileSavings"
										type="text"
										value={isEditIncomeSavings ? editSavings : formatToBRL(savings)}
										disabled={!isEditIncomeSavings}
										onChange={handleChangeSavings}
										className="w-full rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 text-sm text-slate-200 transition focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:text-slate-400" />
								</div>
							</div>
							<div className="mt-5 flex flex-col justify-end gap-3 sm:flex-row">
								{isEditIncomeSavings && (
									<button
										type="button"
										onClick={handleCancelEdit}
										disabled={isLoadingEdit}
										className="inline-flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
									>
										<FiX />
										Cancelar
									</button>
								)}
								<button
									type="button"
									disabled={isLoadingEdit}
									onClick={handleEditIncomeSavings}
									className="inline-flex items-center justify-center gap-2 rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117] disabled:cursor-not-allowed disabled:opacity-60">
									{isEditIncomeSavings ? <FiCheck /> : <FiEdit3 />}
									{isEditIncomeSavings ? 'Salvar alterações' : 'Editar dados'}
								</button>
							</div>
						</form>

						<div className="rounded-lg border border-white/10 bg-white/[0.04] p-4 text-slate-200">
							<div className="flex items-center gap-2 text-sm font-semibold text-white">
								<FiUser className="text-slate-400" />
								Resumo da conta
							</div>
							<div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
								<div>
									<p className="text-xs uppercase text-slate-500">Renda mensal</p>
									<p className="mt-1 font-medium">{formatToBRL(salary)}</p>
								</div>
								<div>
									<p className="text-xs uppercase text-slate-500">Reservas</p>
									<p className="mt-1 font-medium">{formatToBRL(savings)}</p>
								</div>
								<div>
									<p className="text-xs uppercase text-slate-500">Dia do salário</p>
									<p className="mt-1 font-medium">{salaryDay ? `${salaryDay}º` : '--'}</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
