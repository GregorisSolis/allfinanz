function numberFormat(input) {
  if (typeof input !== 'string') {
    input = String(input);
  }

  // Eliminar todo excepto números, punto y coma
  input = input.replace(/[^0-9,.-]/g, '').trim();

  // Reemplazar coma por punto
  if (input.includes(',')) {
    input = input.replace(',', '.');
  }

  let num = parseFloat(input);

  if (isNaN(num)) return 0.00;

  return num * 100;
}

function toDecimalFormat(value) {
  let num = parseFloat(value);

  if (isNaN(num)) return 0.00;

  return Number((num / 100).toFixed(2));
}

function formatToTwoDecimals(value) {
  let num = parseFloat(value);
  if (isNaN(num)) return 0.00;
  return Number(num.toFixed(2));
}

module.exports = { numberFormat, toDecimalFormat, formatToTwoDecimals };
