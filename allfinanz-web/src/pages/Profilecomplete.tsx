import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'


export function ProfileComplete(){

	document.title = 'Allfinanz - Perfil'
	const [message, setMessage] = useState('')
	const [savings, setSavings] = useState('')
	const [monthlyIconme, setMonthlyIconme]  = useState()
	const ID_USER = localStorage.getItem('iden')
	const navigate = useNavigate()

	async function setSavingsAndMonthlyIconmeDB(event: FormEvent){
		event.preventDefault()

		if(!savings || !monthlyIconme || isNaN(monthlyIconme) || isNaN(savings)){
			setMessage("La información no se puede enviar.")
		}else{
			await API.put(`/auth/edit/${ID_USER}`, { savings, monthlyIconme })
			.then(resp => {
				navigate('/login')
			})
			.catch(err => {
				setMessage('No se pudo agregar los datos.')
			})
		}
	}

	return(
		<div className="w-full min-h-96 text-white flex my-16">
			<div className="m-auto min-w-2/4 w-1/4 rounded bg-brand-200 shadow-lg p-4">
				<form onSubmit={setSavingsAndMonthlyIconmeDB} className="flex flex-col text-center">
					<h1 className="text-4xl mb-8">Completar</h1>
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none" onChange={e => setMonthlyIconme(e.target.value)}placeholder="Renda Mensual"/>
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none" onChange={e => setSavings(e.target.value)}placeholder="Ahorros"/>
					<p className='text-red-500 normal-case transition h-8'>{message}</p>
					<button type="submit" className="transition my-8 bg-sky-600 w-40 py-2 hover:bg-sky-500 rounded m-auto">Agregar e ir para login</button>
				</form>
			</div>
		</div>
	)
}