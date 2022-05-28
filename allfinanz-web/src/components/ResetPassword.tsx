import { useState } from 'react'
import { API } from '../services/api'

export function ResetPassword(props){

		const ID_USER = localStorage.getItem('iden')
		let [password, setPassword] = useState('')
		let [message, setMessage] = useState('')


		async function setUpdatePassword(event: FormEvent){
		event.preventDefault()

		if(!password){
			setMessage("Escribe una contraseña.")
		}else if(password.length < 7){
			setMessage("Contraseña muy debil.")
		}else{
			await API.put(`/auth/edit_password/${ID_USER}`, {password})
			.then( resp => {
				props.reload()
				props.closeComponent()
			})
		}
	}

	return(
		<div className="m-0 fixed bg-brand-100 inset-0 transition flex justify-center items-center">
			<form className="text-white bg-brand-800 flex flex-col p-4 rounded text-center w-[35%]" onSubmit={setUpdatePassword}>
				<h1 className="text-2xl">Crear nueva contraseña</h1>
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" placeholder="nueva contraseña" onChange={e => setPassword(e.target.value)}/>
				<div className="m-4">
					<button className="mx-4 bg-sky-600 rounded p-2" type="submit">Confirmar</button>
					<button className="mx-4 bg-red-600 rounded p-2" onClick={() => props.closeComponent()}>Cerrar</button>
				</div>
				<p className='text-orange-500 normal-case transition h-12'>{message}</p>
			</form>
		</div>
	)
}