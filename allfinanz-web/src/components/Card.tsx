import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Pen, Trash } from 'phosphor-react'
import { API } from '../services/api'
import { date_now } from '../services/dateCreate'

interface CardProps {
	backgroundValue: String,
	colorFont: String,
	nameCard: String,
	IDCard: String,
	date: {year: number, month: number, day: number},
	cardCloseDay: String,
	listCostFixed: never[],
	listCostMonth: never[],
	reload: () => void
}

export function Card(props: CardProps) {

	useEffect(() => {
		loadTotalMonth()
	})

	let IDCard = props.IDCard
	let colorFont = props.colorFont
	let backgroundValue = props.backgroundValue
	let [totalCost, setTotalCost] = useState(0)
	let date = props.date
	
	if(isNaN(date.month) || isNaN(date.year)){
		date = date_now()
	}

	function loadTotalMonth() {
		let total = 0
		props.listCostFixed.map((trans: any) => {
			if (trans.card === props.nameCard && trans.type === 'credit') {
				total = total + parseFloat(trans.value.$numberDecimal)
			}
		})

		props.listCostMonth.map((trans: any) => {
			if (trans.card === props.nameCard && trans.type === 'credit' && trans.date.month === date.month && trans.date.year === date.year) {
				total = total + parseFloat(trans.value.$numberDecimal)
			}
		})

		setTotalCost(total)
	}


	function removeCard() {
		API.delete(`/card/remove-card/${IDCard}`)
		props.reload()
	}

	return (
		<div
		className='min-w-[300px] h-[210px] shadow-md rounded m-4 p-4 flex-col cursor-pointer hover:opacity-80'
			// @ts-ignore
			style={{ background: backgroundValue, currentcolor: colorFont }}
		>
			<div className='h-16'>
				<h1 className="text-4xl">{props.nameCard}</h1>
			</div>

			<div className="w-full">
				<span className="text-xs flex justify-end">uso del mes</span>
				<p className="text-2xl font-bold flex justify-end ">$ {totalCost.toFixed(2)}</p>
			</div>

			<div className='flex flex-col'>
				<span className="text-xs">Cierre de factura:</span>
				<span className="text-xl">dia {props.cardCloseDay}</span>
			</div>
			<div className="flex justify-end">
				<p className="hover:text-red-500" ><Trash onClick={() => removeCard()} size={20} /></p>
				<Link to={`/modificar/card/${props.nameCard}`} className="hover:text-sky-500" ><Pen size={20} /></Link>
			</div>
		</div>
	)
}