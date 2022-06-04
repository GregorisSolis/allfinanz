export function date_now(){
	let date = new Date()
		
	return {
		year: date.getFullYear(), 
		month: date.getMonth()+2, 
		day: date.getDate()
	}
}