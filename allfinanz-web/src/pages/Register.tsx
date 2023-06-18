import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageComponent } from '../components/MessageComponent'
import { API } from '../services/api'
import { login } from '../services/auth'


export function Register() {

	document.title = 'Allfinanz - Registrate'
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [name, setName] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [password, setPassword] = useState('')
	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')
	let [typeMessage, setTypeMessage] = useState('')
	let [linkMessage, setLinkMessage] = useState('0')


	async function setRegister(event: FormEvent) {
		event.preventDefault()

		if (!password || !email || !confirmPassword || !name) {
			setTextMessage('Debes llenar todos los campos.')
			setTypeMessage('warning');
			setLinkMessage('0')
			setIsMessage(true)
		} else {

			if (password !== confirmPassword) {
				setTextMessage('Las contraseñas no coinciden.')
				setTypeMessage('warning');
				setLinkMessage('0')
				setIsMessage(true)
			} else if (password.length <= 7) {
				setTextMessage('La contraseña es muy debil. intenta agregar - !@#$%* - y mas de 7 caracteres.')
				setTypeMessage('warning');
				setLinkMessage('0')
				setIsMessage(true)
			} else if (!email.includes("@") && !email.includes(".com")) {
				setTextMessage('Email invalido intenta otro.')
				setTypeMessage('warning');
				setLinkMessage('0')
				setIsMessage(true)
			} else {

				await API.post('/auth/register', { email, password, name })
					.then(resp => {
						login(resp.data.token)
						localStorage.setItem('iden', resp.data.user._id)
						navigate(`/perfil/completar/`)
					})
					.catch(() => {
						setTextMessage('El email ya esta registrado por otro usuario.')
						setTypeMessage('warning');
						setLinkMessage('0')
						setIsMessage(true)
					})
			}
		}

	}

	return (
		<div className="w-full min-h-96 text-white flex my-16">
			{isMessage ? 
				<MessageComponent 
					text={textMessage} 
					type={typeMessage} 
					link_title={linkMessage} 
					link={() => navigate('/login')} 
					action={() => setIsMessage(false)} 
				/> 
			: null}

			<div className="m-auto md:w-[90%] lg:w-1/4 rounded bg-brand-200 shadow-xl p-4">
				<form onSubmit={setRegister} className="flex flex-col text-center">
					<h1 className="text-4xl mb-8">Crear cuenta</h1>
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setName(e.target.value)} placeholder="nombre completo" />
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setEmail(e.target.value)} placeholder="email" />
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setPassword(e.target.value)} placeholder="password" />
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setConfirmPassword(e.target.value)} placeholder="confirmar contraseña" />
					<button type="submit" className="transition my-8 bg-sky-600 w-40 py-2 hover:bg-sky-500 rounded m-auto">Crear</button>
					<a className="hover:text-sky-500 hover:underline transition" href="/login">Ir a login</a>
				</form>
			</div>
		</div>
	)
}