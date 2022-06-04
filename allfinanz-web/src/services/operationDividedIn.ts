import { API } from './api'
import { date_now } from './dateCreate'

export const setDividedInTransaction = (value,description,category,type,card,dividedIn,isDivided) => {

	let month = date_now().month + 1
	let year = date_now().year
	let date = {}

	value = value / dividedIn

	for(let running = 0; running < dividedIn; running++){
		if(month === 13){
			month = 1
			year++
		}
		date = {year,month,day:1}

		API.post('/operation/new-transaction', {value, description, category, type, date, card, dividedIn, isDivided})

		month++
	}
}