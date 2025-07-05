import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { toast } from 'react-toastify'
import { FiDollarSign, FiTrendingUp } from 'react-icons/fi'
import { formatToBRL, formatToNumber } from '../services/amountFormat'

export function ProfileComplete() {
	document.title = 'Allfinanz | Completar Perfil'
	const [savings, setSavings] = useState('')
	const [salary, setSalary] = useState('')
	const navigate = useNavigate()

	function handleSavingsChange(e: React.ChangeEvent<HTMLInputElement>) {
		const raw = e.target.value.replace(/\D/g, '');
		const numeric = Number(raw);
		setSavings(formatToBRL(numeric));
	}

	function handleMonthlyIncomeChange(e: React.ChangeEvent<HTMLInputElement>) {
		const raw = e.target.value.replace(/\D/g, '');
		const numeric = Number(raw);
		setSalary(formatToBRL(numeric));
	}

	async function setSavingsAndMonthlyIncomeDB(event: FormEvent) {
		event.preventDefault()

		const savingsNumber = formatToNumber(savings);
		const salaryNumber = formatToNumber(salary);

		if (
			!savings || !salary ||
			isNaN(savingsNumber) || isNaN(salaryNumber) ||
			salaryNumber < 1 || savingsNumber < 0
		) {
			toast.warning('Preencha corretamente todos os campos.')
		} else {
			await API.put(`/user/edit`, { savings: savingsNumber, salary: salaryNumber }, { withCredentials: true })
				.then(() => {
					navigate('/login')
				})
				.catch(() => {
					toast.warning('Não foi possível salvar os dados.')
				})
		}
	}

	return (
		<div className="my-4 bg-slate-900 text-white p-6 rounded-xl shadow-lg max-w-md mx-auto ">
			<form className="space-y-6" onSubmit={setSavingsAndMonthlyIncomeDB} noValidate>
				<div className="flex justify-center w-full my-12 mx-auto">
					<h2 className="text-4xl font-thin">Completar perfil</h2>
				</div>

				<div className="flex items-center max-w-3xl border border-slate-700 border-2 rounded bg-transparent px-4 py-3 mb-4">
					<FiTrendingUp className="text-xl text-slate-400 mr-2" />
					<input
						type="text"
						id="salary"
						placeholder="Renda mensal"
						className="bg-transparent outline-none text-xl w-full"
						value={salary}
						onChange={handleMonthlyIncomeChange}
						autoComplete="off"
					/>
				</div>

				<div className="flex items-center max-w-3xl border border-slate-700 border-2 rounded bg-transparent px-4 py-3 mb-4">
					<FiDollarSign className="text-xl text-slate-400 mr-2" />
					<input
						type="text"
						id="savings"
						placeholder="Poupança"
						className="bg-transparent outline-none text-xl w-full"
						value={savings}
						onChange={handleSavingsChange}
						autoComplete="off"
					/>
				</div>

				<div className='items-center max-w-3xl mt-10 pt-10'>
					<button 
						type="submit" 
						className="w-full text-lg my-8 bg-sky-600 py-4 hover:bg-sky-500 rounded m-auto"
					>
						<b>Salvar e ir para login</b>
					</button>
				</div>
			</form>
		</div>
	)
}