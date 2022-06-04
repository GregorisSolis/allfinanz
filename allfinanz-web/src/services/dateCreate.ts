export function date_now(){
	let date = new Date()
		
	return {
		year: date.getFullYear(), 
		month: date.getMonth()+1, 
		day: date.getDate()
	}
}