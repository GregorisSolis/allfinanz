import { FormEvent, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MessageComponent } from '../components/MessageComponent'
import { API } from '../services/api'


export function ProfileComplete() {

	document.title = 'Allfinanz - Perfil'
	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')
	const [savings, setSavings] = useState('')
	const [monthlyIconme, setMonthlyIconme] = useState()
	const ID_USER = localStorage.getItem('iden')
	const navigate = useNavigate()

	async function setSavingsAndMonthlyIconmeDB(event: FormEvent) {
		event.preventDefault()

		if (!savings || !monthlyIconme || isNaN(monthlyIconme) || isNaN(parseInt(savings)) || monthlyIconme < 1 || parseInt(savings) < 0) {
			setTextMessage("La información no se puede enviar.")
			setIsMessage(true)
		} else {
			await API.put(`/auth/edit/${ID_USER}`, { savings, monthlyIconme })
				.then(() => {
					navigate('/login')
				})
				.catch(() => {
					setTextMessage('No se pudo agregar los datos.')
					setIsMessage(true)
				})
		}
	}

	return (
		<div className="w-full min-h-96 text-white flex my-16">
			{isMessage ? 
			
				<MessageComponent text={textMessage} 
				action={() => setIsMessage(false)} 
				type={'null'} 
				link_title={'null'} 
				link={() => null} 
			/> : null}
			<div className="m-auto min-w-2/4 w-1/4 large-content rounded bg-brand-200 shadow-lg p-4">
				<form onSubmit={setSavingsAndMonthlyIconmeDB} className="flex flex-col text-center">
					<h1 className="text-4xl mb-8">Completar</h1>
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none" onChange={(e: any) => setMonthlyIconme(e.target.value)} placeholder="Renda Mensual" />
					<input className="text-center transition w-11/12 m-auto my-4 px-1 text-xl bg-transparent border-b-2 focus:border-sky-500 outline-none" onChange={(e: any) => setSavings(e.target.value)} placeholder="Ahorros" />
					<button type="submit" className="transition bg-sky-600 my-4 w-[70%] p-2 hover:bg-sky-500 rounded m-auto">Agregar e ir para login</button>
				</form>
			</div>
		</div>
	)
}