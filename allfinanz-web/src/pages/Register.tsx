import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { login } from '../services/auth'
import { toast } from 'react-toastify'
import { FiEye, FiEyeOff, FiLock, FiMail, FiUser } from 'react-icons/fi'

export function Register() {

	document.title = 'Allfinanz | Criar conta'
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [name, setName] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)
	const [showConfirmPassword, setShowConfirmPassword] = useState(false)

	async function setRegister(event: FormEvent) {
		event.preventDefault()

		if (!password || !email || !confirmPassword || !name) {
			toast.warning('Você deve preencher todos os campos.')
		} else if (password !== confirmPassword) {
			toast.warning('As senhas não coincidem.')
		} else if (password.length <= 7) {
			toast.warning('A senha é muito fraca. Tente adicionar - !@#$%* - e mais de 7 caracteres.')
		} else if (!email.includes("@") || !email.includes(".com")) {
			toast.warning('E-mail inválido, tente outro.')
		} else {
			await API.post('/user/register', { email, password, name })
				.then(resp => {
					login(resp.data.token)
					localStorage.setItem('iden', resp.data.user._id)
					navigate(`/perfil/completar/`)
				})
				.catch(() => {
					toast.warning('O e-mail já está registrado por outro usuário.')
				})
		}
	}

	return (
		<div className="my-4 bg-slate-900 text-white p-6 rounded-xl shadow-lg max-w-md mx-auto ">
			<form className="space-y-6" onSubmit={setRegister} noValidate>
				<div className="flex justify-center w-full my-12 mx-auto">
					<h2 className="text-4xl font-thin">Criar conta</h2>
				</div>

				<div className="flex items-center max-w-3xl border border-slate-700 border-2 rounded bg-transparent px-4 py-3 mb-4">
					<FiUser className="text-xl text-slate-400 mr-2" />
					<input
						type="text"
						id="name"
						placeholder="Nome completo"
						className="bg-transparent outline-none text-xl w-full"
						onChange={e => setName(e.target.value)}
					/>
				</div>

				<div className="flex items-center max-w-3xl border border-slate-700 border-2 rounded bg-transparent px-4 py-3 mb-4">
					<FiMail className="text-xl text-slate-400 mr-2" />
					<input
						type="email"
						id="email"
						placeholder="E-mail"
						className="bg-transparent outline-none text-xl w-full"
						onChange={e => setEmail(e.target.value)}
					/>
				</div>

				<div className="flex items-center max-w-3xl border border-slate-700 border-2 rounded bg-transparent px-4 py-3 mb-4">
					<FiLock className="text-xl text-slate-400 mr-2" />
					<input
						id="password"
						type={showPassword ? "text" : "password"}
						placeholder="Senha"
						className="bg-transparent outline-none text-xl w-full"
						onChange={e => setPassword(e.target.value)}
						autoComplete="off"
					/>
					<button
						type="button"
						onClick={() => setShowPassword(!showPassword)}
						className="focus:outline-none ml-2"
						tabIndex={-1}
					>
						{showPassword ? (
							<FiEyeOff className="text-xl text-slate-400" />
						) : (
							<FiEye className="text-xl text-slate-400" />
						)}
					</button>
				</div>

				<div className="flex items-center max-w-3xl border border-slate-700 border-2 rounded bg-transparent px-4 py-3">
					<FiLock className="text-xl text-slate-400 mr-2" />
					<input
						id="confirmPassword"
						type={showConfirmPassword ? "text" : "password"}
						placeholder="Confirmar senha"
						className="bg-transparent outline-none text-xl w-full"
						onChange={e => setConfirmPassword(e.target.value)}
						autoComplete="off"
					/>
					<button
						type="button"
						onClick={() => setShowConfirmPassword(!showConfirmPassword)}
						className="focus:outline-none ml-2"
						tabIndex={-1}
					>
						{showConfirmPassword ? (
							<FiEyeOff className="text-xl text-slate-400" />
						) : (
							<FiEye className="text-xl text-slate-400" />
						)}
					</button>
				</div>

				<div className='items-center max-w-3xl mt-10 pt-10'>
					<button 
						type="submit" 
						className="w-full text-lg my-8 bg-sky-600 py-4 hover:bg-sky-500 rounded m-auto"
					>
						<b>Criar conta</b>
					</button>
				</div>
			</form>

			<div className='w-full flex justify-center aling-center my-2 py-2'>
				<a className="hover:text-sky-500 hover:underline transition" href="/login">Ir para login</a>
			</div>
		</div>
	)
}