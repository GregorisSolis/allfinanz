import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API, setAuthToken } from '../services/api'
import { toast } from 'react-toastify'
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'
import { isAuthenticated } from '../services/auth'
import { useUser } from '../contexts/UserContext'

export function Login() {
	const { setUser, setIsAuthenticated } = useUser();
	const navigate = useNavigate();

	useEffect(() => {
		checkAuth();
	}, []);

	document.title = 'Allfinanz | Login'
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [showPassword, setShowPassword] = useState(false)

	const checkAuth = async () => {
		if (await isAuthenticated()) {
			navigate("/dashboard");
		}
	};

	async function setLogin(event: FormEvent) {
		event.preventDefault()

		if (!password || !email) {
			toast.warning('Você deve preencher todos os campos.')
		} else {
			await API.post('/user/authenticate', { email, password }, { withCredentials: true })
				.then(resp => {
					if(resp){
						setAuthToken(resp.data.token);
						// Salvar dados do usuário no estado global
						setUser({
							name: resp.data.user.name,
							email: resp.data.user.email,
							avatar: resp.data.user.imageUrl,
							salary_day: resp.data.user.salary_day
						});
						setIsAuthenticated(true);
						navigate("/dashboard");
					}
				})
				.catch(() => {
					toast.warning('Ops... algo está errado, verifique seu e-mail ou senha.')
				})
		}
	}

	return (
		<div className="flex items-center justify-center min-h-screen px-4">
		<div className="w-full bg-[#0d1117] text-slate-100 p-6 rounded-lg border border-white/10 shadow-[0_20px_60px_-38px_rgba(0,0,0,0.9)] max-w-md">

			<form className="space-y-6" onSubmit={setLogin} noValidate>

				<div className="flex flex-col items-center w-full my-10 mx-auto">
					<h2 className="text-2xl font-semibold text-white">Login</h2>
					<p className="mt-2 text-sm text-slate-400">Acesse sua conta para continuar.</p>
				</div>

				<div className="flex flex-col">
					<label className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-2" htmlFor="email">E-mail</label>
					<div className="flex items-center rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 transition focus-within:ring-2 focus-within:ring-slate-500">
						<FiMail className="text-sm text-slate-400 mr-2 flex-shrink-0" />
						<input
							type="email"
							id="email"
							placeholder="seu@email.com"
							className="bg-transparent outline-none text-sm text-slate-200 w-full placeholder:text-slate-500"
							onChange={e => setEmail(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex flex-col">
					<label className="text-xs uppercase tracking-[0.2em] text-slate-300 mb-2" htmlFor="password">Senha</label>
					<div className="flex items-center rounded-lg border border-slate-700 bg-transparent px-4 py-2.5 transition focus-within:ring-2 focus-within:ring-slate-500">
						<FiLock className="text-sm text-slate-400 mr-2 flex-shrink-0" />
						<input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							className="bg-transparent outline-none text-sm text-slate-200 w-full placeholder:text-slate-500"
							onChange={e => setPassword(e.target.value)}
							autoComplete="off"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="focus:outline-none ml-2 flex-shrink-0"
							tabIndex={-1}
						>
							{showPassword ? (
								<FiEyeOff className="text-sm text-slate-400 hover:text-slate-200 transition" />
							) : (
								<FiEye className="text-sm text-slate-400 hover:text-slate-200 transition" />
							)}
						</button>
					</div>
				</div>

				<div className="pt-4">
					<button
						type="submit"
						className="w-full rounded-lg border border-emerald-300/30 bg-emerald-300 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-emerald-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0d1117]"
					>
						Entrar
					</button>
				</div>
			</form>

			<div className="w-full flex justify-between items-center mt-6 pt-4 border-t border-white/10">
				<a
					className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
					href="/registrate"
				>
					Criar conta
				</a>
				<a
					className="rounded-lg border border-white/10 bg-transparent px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
					href="/recuperar-cuenta"
				>
					Esqueci minha senha
				</a>
			</div>
		</div>
		</div>
	)
}
