import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { login } from '../services/auth'
import { toast } from 'react-toastify'
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'

export function Login() {

	document.title = 'Allfinanz | Login'
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	async function setLogin(event: FormEvent) {
		event.preventDefault()

		if (!password || !email) {
			toast.warning('Você deve preencher todos os campos.')
		} else {

			await API.post('/user/authenticate', { email, password })
				.then(resp => {
					login(resp.data.token)
					localStorage.setItem('iden', resp.data.user._id)
					navigate('/dashboard')
				})
				.catch(() => {
					toast.warning('Ops... algo está errado, verifique seu e-mail ou senha.')
				})
		}

	}

	return (
		<div className="my-4 bg-slate-900 text-white p-6 rounded-xl shadow-lg max-w-md mx-auto ">

			<form className="space-y-6" onSubmit={setLogin} noValidate>
				
				<div className="flex justify-center w-full my-12 mx-auto">
					<h2 className="text-4xl font-thin">Login</h2>
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

				<div className="flex items-center max-w-3xl border border-slate-700 border-2 rounded bg-transparent px-4 py-3">
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

				<div className='items-center max-w-3xl mt-10 pt-10'>
					<button 
						type="submit" 
						className="w-full text-lg my-8 bg-sky-600 py-4 hover:bg-sky-500 rounded m-auto"
					>
						<b>Entrar</b>
					</button>
				</div>
			</form>

			<div className='w-full flex justify-between aling-center my-2 py-2'>
				<a className="hover:text-sky-500 hover:underline transition" href="/registrate">Criar conta</a>
				<a className="hover:text-sky-500 hover:underline transition" href="/recuperar-cuenta">Esqueci minha senha</a>
			</div>
		</div>
	)
}