import { API } from './api'
import { date_now } from './dateCreate'


export const setDividedInTransaction = (value: string,description:string ,category: string,type: string,card: string,dividedIn: number,isDivided: boolean) => {

	let month = date_now().month
	let year = date_now().year
	let date = {}
	let valueDivided: number

	valueDivided = parseFloat(value) / dividedIn

	for(let running = 0; running < dividedIn; running++){
		if(month === 13){
			month = 1
			year++
		}
		date = {year,month,day:1}

		API.post('/operation/new-transaction', {value: (valueDivided).toFixed(2), description, category, type, date, card, dividedIn, isDivided})

		month++
	}
}