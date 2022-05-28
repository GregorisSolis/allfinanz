import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from "../components/Navbar"
import { UpdateUser } from "../components/UpdateUser"
import { ResetPassword } from "../components/ResetPassword"
import { UpdatePhoto } from "../components/UpdatePhoto"
import { API } from '../services/api'

import imgNotFound from '../assets/imgNotFound.jpg'


export function Profile(){

	useEffect(() => {
		loadUser()
	},[])

	document.title = 'Allfinanz - Perfil'
	const ID_USER = localStorage.getItem('iden')
	const navigate = useNavigate()
	let [name, setName] = useState('')
	let [savings, setSavings] = useState(0)
	let [monthlyIconme, setMonthlyIconme] = useState(0)
	let [email, setEmail] = useState('')
	let [numberCard, setNumberCard] = useState('')
	let [numberTransaction, setNumberTransaction] = useState('')
	let [isUpdateUser, setIsUpdateUser] = useState(false)
	let [isUpdateFoto, setIsUpdateFoto] = useState(false)
	let [isUpdatePass, setIsUpdatePass] = useState(false)
	let [imageUrl, setImageUrl] = useState(imgNotFound)
	let [imageID, setImageID] = useState('')
	let [amountTransaction, setAmountTransaction] = useState()
	let [amountCard, setAmountCard] = useState()

	async function loadUser(){

		await API.get(`/auth/info-user/${ID_USER}`)
			.then(resp => {
				setName(resp.data.user.name)
				setSavings(resp.data.user.savings.$numberDecimal)
				setMonthlyIconme(resp.data.user.monthlyIconme.$numberDecimal)
				setEmail(resp.data.user.email)
				setAmountTransaction(resp.data.user.amountTransaction)
				setAmountCard(resp.data.user.amountCard)
				if(resp.data.user.imageUrl !== undefined){
					setImageUrl(resp.data.user.imageUrl)
					setImageID(resp.data.user.imageID)
				}
			})
			.catch(err =>{
				navigate('/login')
			})
	}

	return(
		<>
		<Navbar />

		{isUpdateUser ? 
			<UpdateUser 
				closeComponent={() => setIsUpdateUser(false)}
				email={email}
				name={name}
				monthlyIconme={monthlyIconme}
				reload={() => loadUser()}
			/> 
		: null}		

		{isUpdateFoto ? 
			<UpdatePhoto 
				closeComponent={() => setIsUpdateFoto(false)}
				reload={() => loadUser()}
				idForRemove={imageID}
			/> 
		: null}

		{isUpdatePass ? 
			<ResetPassword 
				closeComponent={() => setIsUpdatePass(false)}
				reload={() => loadUser()}
			/> 
		: null}		


		<div className="w-full h-96 text-white flex">
			<div className="w-8/12 m-auto p-4">

				<div className="flex justify-between items-center">
					<div className="overflow-hidden my-4 border-solid border-sky-900 h-52 bg-brand-200 w-52 border-8 rounded-full shadow-lg">
						<img className="w-full h-full object-cover" src={imageUrl} alt="photo profile"/>
					</div>

					<h1 className="text-5xl capitalize">{name}</h1>
				</div>

				<div className="m-4 w-full rounded flex justify-between items-center">
					<div className="bg-brand-200 w-[23%] h-16 text-center rounded shadow-lg p-1">
						<span className="text-sm">Renda mensual</span>
						<p className="text-2xl font-bold">$ {monthlyIconme}</p>
					</div>					
					<div className="bg-brand-200 w-[23%] h-16 text-center rounded shadow-lg p-1">
						<span className="text-sm">Dinero ahorrado</span>
						<p className="text-2xl font-bold">$ {savings}</p>
					</div>					
					<div className="bg-brand-200 w-[23%] h-16 text-center rounded shadow-lg p-1">
						<span className="text-sm">Transacciones</span>
						<p className="text-2xl font-bold">{amountTransaction}</p>
					</div>					
					<div className="bg-brand-200 w-[23%] h-16 text-center rounded shadow-lg p-1">
						<span className="text-sm">Nº Tarjetas</span>
						<p className="text-2xl font-bold">{amountCard}</p>
					</div>
				</div>

				<div className="bg-brand-200 w-full p-4 m-4 rounded shadow-lg">

					<div className="my-5 mx-4 flex flex-col">
						<span className="text-sm">email:</span>
						<p className="my-1 text-xl w-2/5 text-white p-1">{email}</p>
					</div>					
			
					<div className="my-5 mx-4 flex justify-center items-center">
						<button className="bg-sky-800 mx-4 p-2 rounded hover:bg-sky-500" onClick={() => setIsUpdateUser(true)}>Editar información</button>
						<button className="bg-sky-800 mx-4 p-2 rounded hover:bg-sky-500" onClick={() => setIsUpdateFoto(true)}>Editar foto</button>
						<button className="bg-sky-800 mx-4 p-2 rounded hover:bg-sky-500" onClick={() => setIsUpdatePass(true)}>Cambiar contraseña</button>
					</div>

				</div>

			</div>
		</div>
		</>
	)
}