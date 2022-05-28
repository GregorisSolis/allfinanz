import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { login } from '../services/auth'


export function Register(){

	document.title = 'Allfinanz - Registrate'
	const navigate = useNavigate()
	const [email, setEmail] = useState('')
	const [name, setName] = useState('')
	const [confirmPassword, setConfirmPassword] = useState('')
	const [password, setPassword] = useState('')
	const [message, setMessage] = useState('Al crear la contraseña recuerda usar simbolos y mas de 7 caracteres.')

	async function setRegister(event: FormEvent){
		event.preventDefault()

		if(!password || !email || !confirmPassword || !name){
			setMessage('Debes llenar todos los campos.')
		}else{

		if(password !== confirmPassword){
			setMessage('Las contraseñas no coinciden.')
		}else if(password.length <= 7){
			setMessage('La contraseña es muy debil. intenta agregar !@#$%* y recuerda mas de 7 caracteres.')
		}else if(!email.includes("@",".com")){
			setMessage('Email invalido intenta otro.')
		}else{

			await API.post('/auth/register', { email,password,name })
			.then(resp => {
				login(resp.data.token)
				localStorage.setItem('iden',resp.data.user._id)
				navigate(`/perfil/completar/`)
			})
			.catch(err => {
				setMessage('El email ya esta registrado por otro usuario.')
			})
			}
		}
		
	}

	return(
		<div className="w-full min-h-96 text-white flex my-16">
			<div className="m-auto min-w-[50%] w-2/4 rounded bg-brand-200 shadow-lg p-4">
				<form onSubmit={setRegister} className="flex flex-col text-center">
					<h1 className="text-4xl mb-8">Crear cuenta</h1>
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setName(e.target.value)}placeholder="nombre completo"/>
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setEmail(e.target.value)}placeholder="email"/>
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setPassword(e.target.value)} placeholder="password"/>
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 hover:border-sky-600 focus:border-sky-500 outline-none" onChange={e => setConfirmPassword(e.target.value)} placeholder="confirmar contraseña"/>
					<p className='text-orange-500 normal-case transition h-8'>{message}</p>
					<button type="submit" className="transition my-8 bg-sky-600 w-40 py-2 hover:bg-sky-500 rounded m-auto">Crear</button>
					<a className="hover:text-sky-500 hover:underline transition" href="/login">Ir a login</a>
				</form>
			</div>
		</div>
	)
}