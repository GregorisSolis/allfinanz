// Format value to BRL currency
export function formatToBRL(value: number) {
	const adjusted = value / 100;
	return adjusted.toLocaleString('pt-BR', {
	  style: 'currency',
	  currency: 'BRL',
	  minimumFractionDigits: 2,
	});
  }

// Para el report
export function formatToBRL_report(value: number) {
	return value.toLocaleString('pt-BR', {
	  style: 'currency',
	  currency: 'BRL',
	  minimumFractionDigits: 2,
	});
  }
  
  
// Convert BRL currency string to number (in cents)
export function formatToNumber(value: string): number {
	const numeric = value.replace(/\D/g, ''); // Solo dígitos
	return Number(numeric);
  }
  
  
  