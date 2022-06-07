//CREAR LA DATA ACTUAL

export function date_now(){
	let now = new Date()

	return {
		year: now.getFullYear(), 
		month: now.getMonth()+1, 
		day: now.getDate()
	}
}