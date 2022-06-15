import { FormEvent, useState } from 'react'
import { API } from '../services/api'
import { MessageComponent } from './MessageComponent'

interface ResetPasswordProps {
	reload: () => void,
	closeComponent: () => void,
}

export function ResetPassword(props: ResetPasswordProps) {

	const ID_USER = localStorage.getItem('iden')
	let [password, setPassword] = useState('')
	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')


	async function setUpdatePassword(event: FormEvent) {
		event.preventDefault()

		if (!password) {
			setTextMessage("Escribe una contraseña.")
			setIsMessage(true)
		} else if (password.length < 7) {
			setTextMessage("Contraseña muy debil.")
			setIsMessage(true)
		} else {
			await API.put(`/auth/edit_password/${ID_USER}`, { password })
				.then(() => {
					props.reload()
					props.closeComponent()
				})
		}
	}

	return (
		<div className="m-0 fixed bg-brand-100 inset-0 transition flex justify-center items-center">
			{isMessage ? <MessageComponent text={textMessage} action={() => setIsMessage(false)} /> : null}

			<form className="text-white bg-moon-500 flex flex-col p-4 rounded text-center w-[35%] large-content" onSubmit={setUpdatePassword}>
				<h1 className="text-2xl">Crear nueva contraseña</h1>
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" placeholder="nueva contraseña" onChange={e => setPassword(e.target.value)} />
				<div className="m-4">
					<button className="mx-4 bg-sky-600 rounded p-2" type="submit">Confirmar</button>
					<button className="mx-4 bg-red-600 rounded p-2" onClick={() => props.closeComponent()}>Cerrar</button>
				</div>
			</form>
		</div>
	)
}