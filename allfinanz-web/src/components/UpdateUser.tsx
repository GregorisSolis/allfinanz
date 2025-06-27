import { FormEvent, useState } from 'react'
import { API } from '../services/api'

interface UpdateUserProps {
	name: string,
	monthlyIconme: string,
	email: string,
	savings: string,
	reload: () => void,
	closeComponent: () => void
}

export function UpdateUser(props: UpdateUserProps) {

	let [isMessage, setIsMessage] = useState(false)
	let [textMessage, setTextMessage] = useState('')
	let [name, setName] = useState(props.name)
	let [monthlyIconme, setMonthlyIconme] = useState(props.monthlyIconme)
	let [email, setEmail] = useState(props.email)
	let [savings, setSavings] = useState(props.savings)
	const ID_USER = localStorage.getItem('iden')

	if (savings.includes(',') || monthlyIconme.includes(',')) {
		setSavings(savings.replace(',', '.'))
		setMonthlyIconme(monthlyIconme.replace(',', '.'))
	}

	async function setUpdateUser(event: FormEvent) {
		event.preventDefault()

		if (!email || !name || !monthlyIconme || !savings) {
			setTextMessage("Los campos Nombre, Email y Renda mensual no pueden estar vacio.")
			setIsMessage(true)
		} else if (isNaN(parseInt(monthlyIconme)) || isNaN(parseInt(savings))) {
			setTextMessage("Los campos 'Renda Mensual' y 'Ahorros' solo pueden ser numeros.")
			setIsMessage(true)
		} else {

			await API.put(`/user/edit/${ID_USER}`, { name, email, monthlyIconme: (parseFloat(monthlyIconme)).toFixed(2), savings: (parseFloat(savings)).toFixed(2) })
				.then(() => {
					props.reload()
					props.closeComponent()
				})
		}

	}

	//ESTE CODIGO SE ENCARGA DE FORMATAR EL PRECIO
	if(monthlyIconme.length > 2){
		monthlyIconme = monthlyIconme.replace(/\./g, '');
		monthlyIconme = monthlyIconme.replace(/^0+(?=[1-9])/, '');
		
		
		let before = monthlyIconme.slice(0, -2);
		let after = monthlyIconme.slice(-2);
		monthlyIconme = before + "." +after;
	}
	monthlyIconme = monthlyIconme.replace(/^\./, '');
	monthlyIconme = monthlyIconme.replace(/^[a-zA-Z]+/, '');
	monthlyIconme = monthlyIconme.replace(/^[^a-zA-Z0-9]+/, '');
	monthlyIconme = monthlyIconme.trim();

	//ESTE CODIGO SE ENCARGA DE FORMATAR EL PRECIO
	if(savings.length > 2){
		savings = savings.replace(/\./g, '');
		savings = savings.replace(/^0+(?=[1-9])/, '');
		
		
		let before = savings.slice(0, -2);
		let after = savings.slice(-2);
		savings = before + "." +after;
	}
	savings = savings.replace(/^\./, '');
	savings = savings.replace(/^[a-zA-Z]+/, '');
	savings = savings.replace(/^[^a-zA-Z0-9]+/, '');
	savings = savings.trim();

	return (
		<div className="m-0 fixed bg-brand-100 inset-0 transition flex justify-center items-center">

			<form className="text-white bg-moon-500 flex flex-col p-4 rounded text-center w-[35%] large-content" onSubmit={setUpdateUser}>
				<h1 className="text-2xl">Actualizar información</h1>
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" value={name} placeholder="nombre completo" onChange={e => setName(e.target.value)} />
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" value={email} placeholder="email" onChange={e => setEmail(e.target.value)} />
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" value={monthlyIconme} placeholder="Renda Mensual" onChange={e => setMonthlyIconme(e.target.value)} />
				<input className="m-4 bg-transparent border-b-2 outline-none focus:border-sky-500 hover:border-sky-500" value={savings} placeholder="Renda Mensual" onChange={e => setSavings(e.target.value)} />
				<div className="m-4">
					<button className="mx-4 bg-sky-600 rounded p-2" type="submit">Confirmar</button>
					<button className="mx-4 bg-red-600 rounded p-2" onClick={() => props.closeComponent()}>Cerrar</button>
				</div>
			</form>
		</div>
	)
}