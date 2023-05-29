import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { API } from '../services/api'
import { LineChart } from './LineChart'

interface SidebarInfoUserProps {
	listCostFixed:never[],
	listCostMonth:never[]
}

export function SidebarInfoUser(props: SidebarInfoUserProps){

	useEffect(() => {
		loadDataUser();
	})

	const ID_USER = localStorage.getItem('iden')
	const navigate = useNavigate()
	let [monthlyIconme, setMonthlyIconme] = useState(0)
	let [percentageCostMonth, setPercentageCostMonth] = useState(0)
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
		props.listCostFixed.map((item: any) => {
			value += parseFloat(item.value.$numberDecimal)
		})
		setCostFixed(parseFloat(value.toFixed(2)))

		value = 0
		props.listCostMonth.map((item: any) => {
			value += parseFloat(item.value.$numberDecimal)
		})
		setCostMonth(parseFloat(value.toFixed(2)))

		setTotalCost(parseFloat((costFixed+costMonth).toFixed(2)))
		setMissing(parseFloat((totalCost-monthlyIconme).toFixed(2)))

		operationPercentage();
	}

	function operationPercentage(){
         let percentageCostMonth = (costMonth / monthlyIconme * 100);
		 setPercentageCostMonth(percentageCostMonth);
	}

	return(
		<div className="bg-brand-200 lg:w-[30%] md:w-[90%] h-[30%] my-4 rounded shadow-lg py-4 px-8">
			<h1 className="text-center w-full text-white text-xl">Detalles</h1>

            <LineChart title='Renda mensual' dataValue={monthlyIconme} bg_color='bg-emerald-500' percentage={0} />

            <LineChart title='Gastos fijos' dataValue={costFixed} bg_color='bg-teal-500' percentage={0}/>

            <LineChart title='Gastos del mes' dataValue={costMonth} bg_color='bg-purple-700' percentage={percentageCostMonth}/>

            <LineChart title='Gastos total' dataValue={totalCost} bg_color='bg-orange-500' percentage={0}/>		

		</div>
	)
}