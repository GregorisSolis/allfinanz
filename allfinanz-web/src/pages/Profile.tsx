import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ResetPassword } from "../components/ResetPassword"
import { UpdatePhoto } from "../components/UpdatePhoto"
import { API } from '../services/api'
import { toast } from 'react-toastify'

import imgNotFound from '../assets/imgNotFound.jpg'
import { SideBar } from '../components/SideBar'
import { formatToBRL, formatToNumber } from '../services/amountFormat'


export function Profile() {

	useEffect(() => {
		loadUser()
	}, [])

	document.title = 'Allfinanz | Perfil'
	const navigate = useNavigate()
	let [name, setName] = useState('')
	let [savings, setSavings] = useState(0)
	let [salary, setSalary] = useState(0)
	let [email, setEmail] = useState('')
	let [isUpdateUser, setIsUpdateUser] = useState(false)
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

			<div className="flex w-4/5 min-h-screen m-auto">
				<section className="w-1/4 mr-6">
					<SideBar />
				</section>
				<section className="m-auto w-full pb-28 h-screen overflow-hidden pr-4 scrollbar-thin scrollbar-thumb-brand-200 scrollbar-track-brand-600 hover:scrollbar-thumb-brand-100">
					<div className="w-full max-w-xl bg-slate-800 rounded-xl shadow-2xl p-8 m-auto">
						<h2 className="text-2xl font-semibold mb-6 text-slate-100 text-center">{name}</h2>
						<div className="flex flex-col items-center mb-6">
							<div onClick={() => setIsUpdateFoto(true)} className="overflow-hidden rounded-full w-32 h-32 border-4 border-slate-200 transition hover:opacity-80 mb-4 cursor-pointer">
								<img className="object-cover w-full h-full" src={imageUrl} alt="foto de perfil" />
							</div>
	
						</div>
						<form className="flex flex-col gap-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-slate-300 mb-1">Email</label>
									<input type="text" value={email} disabled className="w-full px-4 py-3 rounded-lg bg-transparent text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
								</div>
								<div>
									<label className="block text-slate-300 mb-1">Renda Mensal</label>
									<input
										type="text"
										value={isEditIncomeSavings ? editSalary : formatToBRL(salary)}
										disabled={!isEditIncomeSavings}
										onChange={handleChangeSalary}
										className="w-full px-4 py-3 rounded-lg bg-transparent text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
								</div>
								<div>
									<label className="block text-slate-300 mb-1">Dia do Salário</label>
									<input
										type="number"
										min="1"
										max="31"
										value={salaryDay}
										disabled={!isEditIncomeSavings}
										onChange={e => setSalaryDay(e.target.value)}
										className="w-full px-4 py-3 rounded-lg bg-transparent text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
								</div>
								<div>
									<label className="block text-slate-300 mb-1">Ahorros</label>
									<input
										type="text"
										value={isEditIncomeSavings ? editSavings : formatToBRL(savings)}
										disabled={!isEditIncomeSavings}
										onChange={handleChangeSavings}
										className="w-full px-4 py-3 rounded-lg bg-transparent text-slate-200 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500" />
								</div>
							</div>
							<div className="flex gap-4 mt-4">
								<button
									type="button"
									disabled={isLoadingEdit}
									onClick={handleEditIncomeSavings}
									className="w-full py-3 rounded-lg font-semibold text-white bg-cyan-700 hover:bg-cyan-800 transition">
									{isEditIncomeSavings ? 'Confirmar' : 'Liberar campos'}
								</button>
							</div>
						</form>
						<div className="flex gap-4 mt-8">
							<button onClick={() => setIsUpdatePass(true)} className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-cyan-500 to-cyan-700 shadow-lg hover:from-cyan-600 hover:to-cyan-800 transition">Alterar Senha</button>
						</div>
					</div>
				</section>
			</div>
		</>
	)
}