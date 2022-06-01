import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'

export function SidebarInfoUser(){

	useEffect(() => {
		loadDataUser()
	},[])

	const ID_USER = localStorage.getItem('iden')
	const navigate = useNavigate()
	let [monthlyIconme, setMonthlyIconme] = useState('')

	function loadDataUser(){
		API.get(`/auth/info-user/${ID_USER}`)
		.then(resp => {
			setMonthlyIconme(resp.data.user.monthlyIconme.$numberDecimal)
		})
		.catch(err => {
			navigate('/login')
		})
	}

	return(
		<div className="bg-brand-200 w-[30%] h-[30%] my-4 rounded shadow-lg p-4">
			<h1 className="text-center w-full text-sky-800 font-bold text-xl">Detalles</h1>

			<div className="w-full my-2">
				<span className="text-sky-200 text-sm">Renda Mensual:</span>
				<p className="font-bold text-2xl">$ {monthlyIconme}</p>
			</div>

			<div className="w-full my-2">
				<span className="text-sky-200 text-sm">Total de gastos fijos:</span>
				<p className="font-bold text-2xl">$ 455.44</p>
			</div>

			<div className="w-full my-2">
				<span className="text-sky-200 text-sm">Total de gastos del mes:</span>
				<p className="font-bold text-2xl">$ 22.44</p>
			</div>

			<div className="w-full mt-16 text-red-600">
				<span className="text-sky-200 text-sm flex justify-end">Total de gasto:</span>
				<p className="font-bold text-2xl flex justify-end">$ 1222.44</p>
			</div>

		</div>
	)
}