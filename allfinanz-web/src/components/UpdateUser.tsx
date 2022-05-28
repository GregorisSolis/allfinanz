import { useState } from 'react'
import { API } from '../services/api'

export function UpdateUser(props){

	let [message, setMessage] = useState('')
	let [name, setName] = useState(props.name)
	let [monthlyIconme, setMonthlyIconme] = useState(props.monthlyIconme)
	let [email, setEmail] = useState(props.email)
	const ID_USER = localStorage.getItem('iden')



	async function setUpdateUser(event: FormEvent){
		event.preventDefault()

		if(!email || !name || !monthlyIconme){
			setMessage("Los campos Nombre, Email y Renda mensual no pueden estar vacio.")
		}else{
			await API.put(`/auth/edit/${ID_USER}`, {name,email,monthlyIconme})
				.then(resp => {
					props.reload()
					props.closeComponent()
				})			
		}

	}

	return(
		<div className="m-0 fixed bg-brand-100 inset-0 transition flex justify-center items-center">
			<form className="text-white bg-brand-800 flex flex-col p-4 rounded text-center w-[35%]" onSubmit={setUpdateUser}>
				<h1 className="text-2xl">Actualizar información</h1>
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" value={name} placeholder="nombre completo" onChange={e => setName(e.target.value)}/>
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" value={email} placeholder="email" onChange={e => setEmail(e.target.value)}/>
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" value={monthlyIconme} placeholder="Renda Mensual" onChange={e => setMonthlyIconme(e.target.value)}/>
				<div className="m-4">
					<button className="mx-4 bg-sky-600 rounded p-2" type="submit">Confirmar</button>
					<button className="mx-4 bg-red-600 rounded p-2" onClick={() => props.closeComponent()}>Cerrar</button>
				</div>
				<p className='text-orange-500 normal-case transition h-12'>{message}</p>
			</form>
		</div>
	)
}