import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ModifyCard } from './ModifyCard'
import { API } from '../services/api'
import { Pen, Trash } from 'phosphor-react'

export function Card(props){

	let backgroundValue = props.backgroundValue
	let colorFont = props.colorFont
	let IDCard = props.IDCard

	function removeCard(){
		API.delete(`/card/remove-card/${IDCard}`)
		.then(resp => {
			props.reload()
		})
	}

	return(
		<div 
			className='min-w-[300px] h-[210px] shadow-md rounded m-4 p-4 flex-col cursor-pointer hover:shadow-lg' 
			style={{background: backgroundValue, color: colorFont}}
		>
			<div className='h-16'>
				<h1 className="text-4xl">{props.nameCard}</h1>
			</div>

			<div className="w-full">
				<span className="text-xs flex justify-end">uso del mes</span>
				<p className="text-2xl font-bold flex justify-end ">$ {props.totalUsed}</p>
			</div>

			<div>
				<span className="text-xs">Cierre de factura:</span>
				<p className="text-xl">dia {props.cardCloseDay}</p>
			</div>
			<div className="flex justify-end">
				<p className="hover:text-red-500" ><Trash  onClick={() => removeCard()} size={20}/></p>
				<Link to={`/modificar/card/${props.nameCard}`} className="hover:text-sky-500" ><Pen size={20}/></Link>
			</div>
		</div>
	)
}