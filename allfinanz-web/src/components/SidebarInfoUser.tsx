import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'

export function SidebarInfoUser(props){

	useEffect(() => {
		loadDataUser()
	})

	const ID_USER = localStorage.getItem('iden')
	const navigate = useNavigate()
	let [monthlyIconme, setMonthlyIconme] = useState('')
	let [costFixed, setCostFixed] = useState(0)
	let [costMonth, setCostMonth] = useState(0)
	let [totalCost, setTotalCost] = useState(0)
	let [missing, setMissing] = useState(0)

	if(missing < 0){
		missing = 0
	}

	function loadDataUser(){
		API.get(`/auth/info-user/${ID_USER}`)
		.then(resp => {
			setMonthlyIconme(parseFloat(resp.data.user.monthlyIconme.$numberDecimal))
			operationTransactionTotal()
		})
		.catch(err => {
			navigate('/login')
		})
	}

	function operationTransactionTotal(){
		let value = 0
		props.listCostFixed.map((item) => {
			value += parseFloat(item.value.$numberDecimal)
		})
		setCostFixed(parseFloat(value.toFixed(2)))

		value = 0
		props.listCostMonth.map((item) => {
			value += parseFloat(item.value.$numberDecimal)
		})
		setCostMonth(parseFloat(value.toFixed(2)))

		setTotalCost(parseFloat((costFixed+costMonth).toFixed(2)))
		setMissing(parseFloat((totalCost-monthlyIconme).toFixed(2)))
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
				<p className="font-bold text-2xl">$ {costFixed}</p>
			</div>

			<div className="w-full my-2">
				<span className="text-sky-200 text-sm">Total de gastos del mes:</span>
				<p className="font-bold text-2xl">$ {costMonth}</p>
			</div>			

			<div className="w-full my-2">
				<span className="text-sky-200 text-sm">Pasa de la renda mensual:</span>
				<p className="font-bold text-red-600 text-2xl">$ {missing}</p>
			</div>

			<div className="w-full mt-16 text-red-600">
				<span className="text-sky-200 text-sm flex justify-end">Total de gasto:</span>
				<p className="font-bold text-2xl flex justify-end">$ {totalCost}</p>
			</div>

		</div>
	)
}