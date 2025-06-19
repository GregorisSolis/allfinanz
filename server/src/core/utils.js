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

// Función auxiliar para construir filtro de fechas
function buildDateFilter(dateInit, dateEnd) {
  if (!dateInit && !dateEnd) return {};
  
  const dateFilter = { date: {} };
  
  if (dateInit) {
      const initDate = new Date(dateInit);
      if (isNaN(initDate.getTime())) {
          throw new Error('Invalid date_init format');
      }
      dateFilter.date.$gte = initDate;
  }
  
  if (dateEnd) {
      const endDate = new Date(dateEnd);
      if (isNaN(endDate.getTime())) {
          throw new Error('Invalid date_end format');
      }
      dateFilter.date.$lte = endDate;
  }
  
  return dateFilter;
}

module.exports = { numberFormat, toDecimalFormat, formatToTwoDecimals, buildDateFilter};
