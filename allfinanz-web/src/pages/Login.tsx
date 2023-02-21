import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageComponent } from '../components/MessageComponent'
import { API } from '../services/api'
import { login } from '../services/auth'

export function Login() {

	document.title = 'Allfinanz - Login'
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')

	async function setLogin(event: FormEvent) {
		event.preventDefault()

		if (!password || !email) {
			setTextMessage('Debes llenar todos los campos.')
			setIsMessage(true)
		} else {

			await API.post('/auth/authenticate', { email, password })
				.then(resp => {
					login(resp.data.token)
					localStorage.setItem('iden', resp.data.user._id)
					navigate('/dashboard')
				})
				.catch(() => {
					setTextMessage('Ups.. algo no esta bien, revisa tu email o contraseña.')
					setIsMessage(true)
				})
		}

	}

	return (
		<div className="w-full min-h-96 text-white flex my-16">
			{isMessage ? <MessageComponent text={textMessage} action={() => setIsMessage(false)} /> : null}

			<div className="m-auto md:w-[90%] lg:w-1/4 rounded bg-brand-200 shadow-lg p-4">
				<form onSubmit={setLogin} className="flex flex-col text-center">
					<h1 className="text-4xl mb-8">Login</h1>
					<input className="transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none" onChange={e => setEmail(e.target.value)} placeholder="email" />
					<input className="transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none" onChange={e => setPassword(e.target.value)} type="password" placeholder="password" />
					<button type="submit" className="transition my-8 bg-sky-600 w-40 py-2 hover:bg-sky-500 rounded m-auto">Entrar</button>
					<span>Aun no tienes cuenta? <a className="hover:text-sky-500 hover:underline transition" href="/registrate">Crea una ahora</a></span>
					<a className="hover:text-sky-500 hover:underline transition" href="/recuperar-cuenta">Olvide mi contraseña</a>
				</form>
			</div>
		</div>
	)
}