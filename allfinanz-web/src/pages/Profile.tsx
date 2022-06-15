import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from "../components/Navbar"
import { UpdateUser } from "../components/UpdateUser"
import { ResetPassword } from "../components/ResetPassword"
import { UpdatePhoto } from "../components/UpdatePhoto"
import { API } from '../services/api'

import imgNotFound from '../assets/imgNotFound.jpg'


export function Profile() {

	useEffect(() => {
		loadUser()
	}, [])

	document.title = 'Allfinanz - Perfil'
	const ID_USER = localStorage.getItem('iden')
	const navigate = useNavigate()
	let [name, setName] = useState('')
	let [savings, setSavings] = useState('')
	let [monthlyIconme, setMonthlyIconme] = useState('')
	let [email, setEmail] = useState('')
	let [isUpdateUser, setIsUpdateUser] = useState(false)
	let [isUpdateFoto, setIsUpdateFoto] = useState(false)
	let [isUpdatePass, setIsUpdatePass] = useState(false)
	let [imageUrl, setImageUrl] = useState(imgNotFound)
	let [imageID, setImageID] = useState('')

	async function loadUser() {

		await API.get(`/auth/info-user/${ID_USER}`)
			.then(resp => {
				setSavings(resp.data.user.savings)
				setName(resp.data.user.name)
				setSavings(resp.data.user.savings.$numberDecimal)
				setMonthlyIconme(resp.data.user.monthlyIconme.$numberDecimal)
				setEmail(resp.data.user.email)
				if (resp.data.user.imageUrl !== undefined) {
					setImageUrl(resp.data.user.imageUrl)
					setImageID(resp.data.user.imageID)
				}
			})
			.catch(() => {
				navigate('/login')
			})
	}

	return (
		<>
			<Navbar location='profile'/>

			{isUpdateUser ?
				<UpdateUser
					closeComponent={() => setIsUpdateUser(false)}
					email={email}
					name={name}
					monthlyIconme={monthlyIconme}
					savings={savings}
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


			<div className="w-full lg:h-[86vh] md:h-screen mb-12 text-white lg:flex md:block justify-center items-center">
				<div className="lg:w-8/12 md:w-[90%] lg:h-5/6 md:w-full bg-brand-800 rounded-lg shadow-2xl lg:flex md:grid">
					<div className='gradient lg:w-2/6 md:w-full w-full lg:rounded-l-lg md:rounded-none flex flex-col p-5'>
						<div onClick={() => setIsUpdateFoto(true)} className='overflow-hidden rounded-full w-56 h-56 m-auto border-4 border-white transition hover:opacity-80'>
							<img className='object-cover w-full h-full' src={imageUrl} alt="foto de perfil" />
						</div>
						<div className='capitalize m-auto text-center'>
							<h1 className='text-4xl my-4'>{name}</h1>
						</div>
					</div>
					<div className='py-4 px-12 lg:w-[70%] md:w-full'>
						<div className='w-full border-b-2 py-1 border-gray-800'>
							<h2 className='text-2xl capitalize'>información</h2>
						</div>
						<div className='my-8 px-8 lg:flex md:grid justify-between items-center'>
							<div>
								<h2 className='my-2 text-2xl capitalize'>renda mensual</h2>
								<h2 className='my-2 text-lg text-gray-500'>$ {monthlyIconme}</h2>
							</div>
							<div>
								<h2 className='my-1 text-2xl capitalize'>Ahorros</h2>
								<h2 className='my-1 text-lg text-gray-500'>$ {savings}</h2>
							</div>
						</div>
						<div className='my-8 px-8 flex  justify-between items-center'>
							<div>
								<h2 className='my-1 text-2xl capitalize'>Email</h2>
								<h2 className='my-1 text-lg text-gray-500'>{email}</h2>
							</div>
						</div>
						<div className='w-full border-b-2 py-1 border-gray-800'>
							<h2 className='text-2xl capitalize'>Modificar</h2>
						</div>
						<div className='my-8 px-8 flex justify-between items-center'>
							<button onClick={() => setIsUpdatePass(true)} className='bg-sky-800 rounded p-2 shadow-xl hover:bg-sky-500 mx-1'>Contraseña</button>
							<button onClick={() => setIsUpdateUser(true)} className='bg-sky-800 rounded p-2 shadow-xl hover:bg-sky-500 mx-1'>Información</button>
						</div>
					</div>
				</div>
			</div>
		</>
	)
}