function getNextMonthCopyDate(now = new Date()) {
    const dateParts = new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/Sao_Paulo',
        year: 'numeric',
        month: 'numeric'
    }).formatToParts(now);
    const currentYear = Number(dateParts.find(part => part.type === 'year').value);
    const currentMonth = Number(dateParts.find(part => part.type === 'month').value);
    const targetYear = currentMonth === 12 ? currentYear + 1 : currentYear;
    const targetMonth = currentMonth === 12 ? 1 : currentMonth + 1;

    // Noon UTC keeps the stored date on the 15th when displayed in Brazil.
    return new Date(Date.UTC(targetYear, targetMonth - 1, 15, 12));
}

module.exports = getNextMonthCopyDate;
