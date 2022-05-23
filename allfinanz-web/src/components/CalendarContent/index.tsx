import { useState } from 'react'
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import './calendar.css';

export function CalendarContent(){

	const [date, setDate] = useState(new Date());

	return(
		<>
			<div className="m-4">
				<Calendar onChange={setDate} value={date} />
			</div>
			<div className="flex justify-center items-center m-4 p-4 rounded shadow-lg bg-brand-200 h-16 ">
				<p className='text-xl'>
					<span className='bold'>Fecha seleccionada: {date.getDate()}/{date.getMonth() + 1}/{date.getFullYear()}</span>
				</p>
				<div className="flex justify-center items-center m-4">
					<button className="bg-sky-600 hover:bg-sky-500 rounded px-4 py-2 text-xl">Buscar</button>
				</div>
			</div>
		</>

	)
}