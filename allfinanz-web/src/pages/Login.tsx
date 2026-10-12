import { FormEvent, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API, setAuthToken } from '../services/api'
import { toast } from 'react-toastify'
import { FiEye, FiEyeOff, FiLock, FiMail } from 'react-icons/fi'
import { isAuthenticated } from '../services/auth'
import { useUser } from '../contexts/UserContext'
import Dialog from '../components/Dialog'
import logo from '../assets/logo.png'

function getLoginErrorMessage(error: unknown) {
	if (error && typeof error === 'object' && 'isAxiosError' in error) {
		const axiosError = error as {
			message?: string;
			code?: string;
			response?: {
				status?: number;
				statusText?: string;
				data?: unknown;
			};
			config?: {
				method?: string;
				baseURL?: string;
				url?: string;
			};
		}

		const responseData = axiosError.response?.data;
		const apiMessage = responseData && typeof responseData === 'object' && 'message' in responseData
			? String((responseData as { message?: unknown }).message)
			: responseData && typeof responseData === 'object' && 'error' in responseData
				? String((responseData as { error?: unknown }).error)
				: typeof responseData === 'string'
					? responseData
					: undefined;

		const status = axiosError.response?.status
			? `${axiosError.response.status} ${axiosError.response.statusText || ''}`.trim()
			: 'sem status HTTP';
		const method = axiosError.config?.method?.toUpperCase() || 'POST';
		const requestUrl = `${axiosError.config?.baseURL || ''}${axiosError.config?.url || ''}`;

		return [
			`Status: ${status}`,
			`Erro: ${apiMessage || axiosError.message || 'Erro desconhecido'}`,
			axiosError.code ? `Código: ${axiosError.code}` : null,
			`Requisição: ${method} ${requestUrl}`,
		].filter(Boolean).join('\n');
	}

	return error instanceof Error ? error.message : 'Erro desconhecido ao tentar fazer login.';
}

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
	const [loginError, setLoginError] = useState('')

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
				.catch(error => {
					setLoginError(getLoginErrorMessage(error))
				})
		}
	}

	return (
		<div className="relative flex h-[100dvh] min-h-[560px] items-center justify-center overflow-y-auto bg-[#070d18] px-4 py-8 text-slate-100 sm:px-6">
		<div className="pointer-events-none absolute -left-40 -top-48 h-[30rem] w-[30rem] rounded-full bg-blue-600/20 blur-[120px]" />
		<div className="pointer-events-none absolute -bottom-56 right-[8%] h-[34rem] w-[34rem] rounded-full bg-sky-500/10 blur-[140px]" />
		<Dialog
			open={Boolean(loginError)}
			onOpenChange={open => {
				if (!open) setLoginError('')
			}}
			title="Erro ao entrar"
			description={loginError}
			onConfirm={() => setLoginError('')}
			confirmText="Fechar"
			cancelText="Fechar"
			confirmVariant="default"
		/>
		<div className="relative z-10 w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-[#0b1320]/95 p-6 text-slate-100 shadow-[0_32px_100px_-38px_rgba(0,0,0,0.95)] backdrop-blur-xl sm:p-9">
			<div className="mb-9 flex flex-col items-center justify-center gap-3 text-center">
				<div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white p-1 shadow-[0_8px_30px_-10px_rgba(56,189,248,0.45)]">
					<img src={logo} alt="Allfinanz" className="h-full w-full object-contain" />
				</div>
				<div className="text-center">
					<h1 className="text-2xl font-semibold tracking-tight text-white">Allfinanz</h1>
					<p className="mt-1 text-sm text-slate-400">Suas finanças em equilíbrio</p>
				</div>
			</div>

			<form className="space-y-5" onSubmit={setLogin} noValidate>

				<div className="flex flex-col">
					<label className="mb-2 text-sm font-medium text-slate-300" htmlFor="email">E-mail</label>
					<div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 transition focus-within:border-sky-400/50 focus-within:bg-sky-400/[0.04] focus-within:ring-2 focus-within:ring-sky-400/15">
						<FiMail className="shrink-0 text-base text-slate-500" />
						<input
							type="email"
							id="email"
							placeholder="seu@email.com"
							className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
							autoComplete="email"
							onChange={e => setEmail(e.target.value)}
						/>
					</div>
				</div>

				<div className="flex flex-col">
					<label className="mb-2 text-sm font-medium text-slate-300" htmlFor="password">Senha</label>
					<div className="flex h-12 items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 transition focus-within:border-sky-400/50 focus-within:bg-sky-400/[0.04] focus-within:ring-2 focus-within:ring-sky-400/15">
						<FiLock className="shrink-0 text-base text-slate-500" />
						<input
							id="password"
							type={showPassword ? "text" : "password"}
							placeholder="••••••••"
							className="w-full bg-transparent text-sm text-slate-100 outline-none placeholder:text-slate-600"
							onChange={e => setPassword(e.target.value)}
							autoComplete="current-password"
						/>
						<button
							type="button"
							onClick={() => setShowPassword(!showPassword)}
							className="ml-2 shrink-0 rounded-lg p-1 text-slate-500 transition hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
							aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
						>
							{showPassword ? (
								<FiEyeOff className="text-base" />
							) : (
								<FiEye className="text-base" />
							)}
						</button>
					</div>
				</div>

				<div className="pt-2">
					<button
						type="submit"
						className="h-12 w-full rounded-2xl border border-sky-300/30 bg-sky-500 px-5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(14,165,233,0.7)] transition hover:bg-sky-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0b1320]"
					>
						Entrar
					</button>
				</div>
			</form>

			<div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.08] pt-5">
				<a
					className="text-sm font-medium text-slate-300 transition hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
					href="/registrate"
				>
					Criar conta
				</a>
				<a
					className="text-sm text-slate-500 transition hover:text-sky-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
					href="/recuperar-cuenta"
				>
					Esqueci minha senha
				</a>
			</div>
		</div>
		</div>
	)
}
