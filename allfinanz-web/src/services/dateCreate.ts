export function date_now() {
	const date = new Date().toLocaleDateString('sv-SE', {
	  timeZone: 'America/Sao_Paulo',
	});
	// Formato 'YYYY-MM-DD' garantizado por 'sv-SE'
	return date;
  }
  