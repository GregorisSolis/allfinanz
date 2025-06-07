function numberFormat(input) {
  if (typeof input !== 'string') {
    input = String(input);
  }

  // Eliminar todo excepto números, punto y coma
  input = input.replace(/[^0-9,.-]/g, '').trim();

  // Reemplazar coma por punto (formato decimal europeo/americano)
  if (input.includes(',')) {
    input = input.replace(',', '.');
  }

  let num = parseFloat(input);

  if (isNaN(num)) return 0.00;

  
  return num * 100 
}

module.exports = numberFormat;
