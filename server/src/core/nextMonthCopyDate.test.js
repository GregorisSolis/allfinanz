const getNextMonthCopyDate = require('./nextMonthCopyDate');

function formatInBrazil(date) {
    return date.toLocaleDateString('sv-SE', { timeZone: 'America/Sao_Paulo' });
}

describe('getNextMonthCopyDate', () => {
    test('uses the next calendar month and the 15th, regardless of the source date', () => {
        const now = new Date('2026-05-20T15:00:00.000Z');

        expect(formatInBrazil(getNextMonthCopyDate(now))).toBe('2026-06-15');
    });

    test('moves to January 15 of the next year when the current month is December in Brazil', () => {
        const now = new Date('2026-12-31T23:30:00-03:00');

        expect(formatInBrazil(getNextMonthCopyDate(now))).toBe('2027-01-15');
    });
});
