const express = require('express');
const authMiddleware = require('../middlewares/auth');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const CycleClosure = require('../models/cycleClosure');
const { toDecimalFormat, formatToTwoDecimals } = require('../../core/utils');

const router = express.Router();

router.use(authMiddleware);

const MS_PER_DAY = 1000 * 60 * 60 * 24;

// Constantes
const MIN_SALARY_DAY = 1;
const MAX_SALARY_DAY = 31;
const SOURCES = {
    SALARY: 'salary',
    CARRYOVER: 'carryover',
    SAVINGS: 'savings'
};

/**
 * Calcula o período de pagamento baseado no dia do salário
 * @param {number} salary_day - Dia do salário
 * @returns {Object} Objeto com datas do período
 */
const calculatePaymentPeriod = (salary_day) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();

    let first_day_of_period, last_day_of_period;

    // Se hoje é antes do dia do salário, estamos no período anterior
    // Se hoje é no dia do salário ou depois, estamos no período atual
    if (today < salary_day) {
        // Período anterior: do dia do salário do mês anterior até o dia anterior ao salário deste mês
        const previousMonth = month === 0 ? 11 : month - 1;
        const previousYear = month === 0 ? year - 1 : year;
        
        first_day_of_period = new Date(previousYear, previousMonth, salary_day);
        last_day_of_period = new Date(year, month, salary_day - 1, 23, 59, 59, 999);
    } else {
        // Período atual: do dia do salário deste mês até o dia anterior ao salário do próximo mês
        first_day_of_period = new Date(year, month, salary_day);
        last_day_of_period = new Date(year, month + 1, salary_day - 1, 23, 59, 59, 999);
    }

    if (isNaN(first_day_of_period.getTime()) || isNaN(last_day_of_period.getTime())) {
        throw new Error('Intervalo de datas inválido');
    }

    return {
        first_day_of_period,
        last_day_of_period,
        days_in_period: Math.round((last_day_of_period - first_day_of_period) / (1000 * 60 * 60 * 24)) + 1,
        total_days_in_period: Math.floor((last_day_of_period - first_day_of_period) / (1000 * 60 * 60 * 24)) + 1,
        today_day: today - first_day_of_period.getDate()
    };
};

/**
 * Calcula período baseado em um intervalo de datas explícito (inclusive)
 * @param {string} date_init
 * @param {string} date_end
 * @returns {Object|null} Objeto com datas do período
 */
const calculatePeriodFromRange = (date_init, date_end) => {
    if (!date_init && !date_end) return null;
    if (!date_init || !date_end) {
        throw new Error('Both date_init and date_end are required');
    }

    const start = new Date(date_init);
    const end = new Date(date_end);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        throw new Error('Invalid date range');
    }

    if (typeof date_init === 'string' && date_init.length <= 10) {
        start.setHours(0, 0, 0, 0);
    }
    if (typeof date_end === 'string' && date_end.length <= 10) {
        end.setHours(23, 59, 59, 999);
    }

    if (end < start) {
        throw new Error('date_end cannot be before date_init');
    }

    const total_days_in_period = Math.floor((end - start) / MS_PER_DAY) + 1;
    const now = new Date();

    let today_day;
    if (now < start) {
        today_day = 0;
    } else if (now > end) {
        today_day = total_days_in_period;
    } else {
        today_day = Math.floor((now - start) / MS_PER_DAY) + 1;
    }

    return {
        first_day_of_period: start,
        last_day_of_period: end,
        days_in_period: total_days_in_period,
        total_days_in_period,
        today_day
    };
};

const calculateCycleFromStart = (cycle_start, salary_day) => {
    const start = new Date(cycle_start);

    if (isNaN(start.getTime())) {
        throw new Error('Invalid cycle_start');
    }

    if (typeof cycle_start === 'string' && cycle_start.length <= 10) {
        start.setHours(0, 0, 0, 0);
    }

    if (start.getDate() !== salary_day) {
        throw new Error('cycle_start must be the salary day');
    }

    const end = new Date(start.getFullYear(), start.getMonth() + 1, salary_day - 1, 23, 59, 59, 999);
    const total_days_in_period = Math.floor((end - start) / MS_PER_DAY) + 1;
    const now = new Date();

    let today_day;
    if (now < start) {
        today_day = 0;
    } else if (now > end) {
        today_day = total_days_in_period;
    } else {
        today_day = Math.floor((now - start) / MS_PER_DAY) + 1;
    }

    return {
        first_day_of_period: start,
        last_day_of_period: end,
        days_in_period: total_days_in_period,
        total_days_in_period,
        today_day
    };
};

/**
 * Calcula os gastos por tipo de transação
 * @param {Array} transactions - Lista de transações
 * @returns {Object} Objeto com gastos calculados
 */
const calculateExpenses = (transactions) => {
    const salaryTransactions = transactions.filter(t => t.source === SOURCES.SALARY);
    const carryoverTransactions = transactions.filter(t => t.source === SOURCES.CARRYOVER);
    const savingsTransactions = transactions.filter(t => t.source === SOURCES.SAVINGS);

    const total_fixed = salaryTransactions
        .filter(t => t.fixed === true)
        .reduce((acc, t) => acc + toDecimalFormat(t.amount), 0);

    const total_relative = salaryTransactions
        .filter(t => !t.fixed)
        .reduce((acc, t) => acc + toDecimalFormat(t.amount), 0);

    return {
        fixed: formatToTwoDecimals(total_fixed),
        relative: formatToTwoDecimals(total_relative),
        total: formatToTwoDecimals(total_fixed + total_relative),
        carryover_spent: formatToTwoDecimals(
            carryoverTransactions.reduce((acc, t) => acc + toDecimalFormat(t.amount), 0)
        ),
        savings_spent: formatToTwoDecimals(
            savingsTransactions.reduce((acc, t) => acc + toDecimalFormat(t.amount), 0)
        )
    };
};

/**
 * Calcula o carryover disponível
 * @param {Array} transactions - Lista de transações
 * @param {number} daily_limit - Limite diário
 * @param {number} today_day - Dia atual
 * @param {number} days_in_period - Total de dias no período
 * @returns {Object} Objeto com informações do carryover
 */
const calculateCarryover = (transactions, daily_limit, today_day, days_in_period) => {
    const total_available_for_period = formatToTwoDecimals(daily_limit * days_in_period);
    const carryover_spent_total = transactions
        .filter(t => t.source === SOURCES.CARRYOVER)
        .reduce((acc, t) => acc + toDecimalFormat(t.amount), 0);

    const carryover_available = formatToTwoDecimals(
        total_available_for_period - carryover_spent_total
    );

    return {
        spent: formatToTwoDecimals(carryover_spent_total),
        total_available: carryover_available
    };
};

const snapshotTransaction = (transaction) => ({
    originalTransactionId: transaction._id,
    amount: transaction.amount,
    description: transaction.description,
    category: transaction.category,
    type: transaction.type,
    date: transaction.date,
    fixed: transaction.fixed,
    observation: transaction.observation,
    isDivided: transaction.isDivided,
    dividedIn: transaction.dividedIn,
    card: transaction.card,
    source: transaction.source,
    capturedAt: new Date()
});

const getReportData = async (user_id, date_init, date_end) => {
    const user = await User.findById(user_id);
    if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
    }
    if (!user.salary || user.salary <= 0) {
        const error = new Error('Invalid salary value.');
        error.statusCode = 400;
        throw error;
    }
    if (!user.salary_day || user.salary_day < MIN_SALARY_DAY || user.salary_day > MAX_SALARY_DAY) {
        const error = new Error('Invalid salary day value.');
        error.statusCode = 400;
        throw error;
    }

    let rangePeriod;
    try {
        rangePeriod = calculatePeriodFromRange(date_init, date_end);
    } catch (err) {
        err.statusCode = 400;
        throw err;
    }
    const period = rangePeriod || calculatePaymentPeriod(user.salary_day);

    const [fixedTransactions, nonFixedTransactions] = await Promise.all([
        Transaction.find({
            user: user_id,
            fixed: true
        }),
        Transaction.find({
            user: user_id,
            fixed: false,
            date: {
                $gte: period.first_day_of_period,
                $lte: period.last_day_of_period
            }
        })
    ]);

    const transactions = [...fixedTransactions, ...nonFixedTransactions];
    const salary = toDecimalFormat(user.salary);
    const expenses = calculateExpenses(transactions);
    const salary_balance = formatToTwoDecimals(salary - expenses.total);
    const daily_limit = formatToTwoDecimals(salary_balance / period.days_in_period);
    const carryover = calculateCarryover(transactions, daily_limit, period.today_day, period.days_in_period);

    return {
        period,
        salary,
        salary_balance,
        daily_limit,
        expenses,
        carryover
    };
};

const getCycleClosureData = async (user_id, cycle_start) => {
    const user = await User.findById(user_id);
    if (!user) {
        const error = new Error('User not found.');
        error.statusCode = 404;
        throw error;
    }
    if (!user.salary || user.salary <= 0) {
        const error = new Error('Invalid salary value.');
        error.statusCode = 400;
        throw error;
    }
    if (!user.salary_day || user.salary_day < MIN_SALARY_DAY || user.salary_day > MAX_SALARY_DAY) {
        const error = new Error('Invalid salary day value.');
        error.statusCode = 400;
        throw error;
    }

    let period;
    try {
        period = cycle_start
            ? calculateCycleFromStart(cycle_start, user.salary_day)
            : calculatePaymentPeriod(user.salary_day);
    } catch (err) {
        err.statusCode = 400;
        throw err;
    }

    const [fixedTransactions, variableTransactions] = await Promise.all([
        Transaction.find({
            user: user_id,
            fixed: true
        }).sort({ date: -1 }),
        Transaction.find({
            user: user_id,
            fixed: false,
            date: {
                $gte: period.first_day_of_period,
                $lte: period.last_day_of_period
            }
        }).sort({ date: -1 })
    ]);

    const transactions = [...fixedTransactions, ...variableTransactions];
    const salary = toDecimalFormat(user.salary);
    const expenses = calculateExpenses(transactions);
    const salary_balance = formatToTwoDecimals(salary - expenses.total);
    const daily_limit = formatToTwoDecimals(salary_balance / period.days_in_period);
    const carryover = calculateCarryover(transactions, daily_limit, period.today_day, period.days_in_period);

    return {
        user,
        period,
        salary,
        salary_balance,
        daily_limit,
        expenses,
        carryover,
        fixedTransactions,
        variableTransactions
    };
};

const formatLegacyReport = (report) => ({
    success: true,
    period: {
        first_day_of_period: report.period.first_day_of_period.toISOString().split('T')[0],
        last_day_of_period: report.period.last_day_of_period.toISOString().split('T')[0],
        days_in_period: report.period.days_in_period,
        total_days_in_period: report.period.total_days_in_period,
        today_day: report.period.today_day
    },
    salary: {
        base: report.salary.toFixed(2),
        balance: report.salary_balance,
        daily_limit: report.daily_limit
    },
    expenses: {
        fixed: report.expenses.fixed,
        relative: report.expenses.relative,
        total: report.expenses.total
    },
    carryover: report.carryover,
    savings: {
        spent: report.expenses.savings_spent
    }
});

const formatSummaryReport = (report) => ({
    success: true,
    period: {
        start: report.period.first_day_of_period.toISOString().split('T')[0],
        end: report.period.last_day_of_period.toISOString().split('T')[0],
        currentDay: report.period.today_day,
        totalDays: report.period.total_days_in_period
    },
    money: {
        salary: report.salary,
        fixedExpenses: report.expenses.fixed,
        variableExpenses: report.expenses.relative,
        totalExpenses: report.expenses.total,
        available: report.salary_balance,
        dailyLimit: report.daily_limit,
        leisureSpent: report.carryover.spent,
        leisureAvailable: report.carryover.total_available,
        savingsSpent: report.expenses.savings_spent
    }
});

const formatClosureListItem = (closure) => ({
    id: closure._id,
    cycleStart: closure.cycleStart.toISOString().split('T')[0],
    cycleEnd: closure.cycleEnd.toISOString().split('T')[0],
    salaryDaySnapshot: closure.salaryDaySnapshot,
    salarySnapshot: closure.salarySnapshot,
    totals: closure.totals,
    closedAt: closure.closedAt
});

const handleReportError = (res, err) => {
    if (err.statusCode) {
        return res.status(err.statusCode).send({ message: err.message });
    }

    return res.status(500).send({ message: 'Internal server error.' });
};

router.post('/closures', async (req, res) => {
    try {
        const { cycle_start } = req.body;
        const report = await getCycleClosureData(req.userId, cycle_start);

        const closure = await CycleClosure.create({
            user: req.userId,
            cycleStart: report.period.first_day_of_period,
            cycleEnd: report.period.last_day_of_period,
            salaryDaySnapshot: report.user.salary_day,
            salarySnapshot: report.salary,
            fixedTransactionsSnapshot: report.fixedTransactions.map(snapshotTransaction),
            variableTransactionsSnapshot: report.variableTransactions.map(snapshotTransaction),
            totals: {
                fixed: report.expenses.fixed,
                variable: report.expenses.relative,
                total: report.expenses.total,
                salaryBalance: report.salary_balance,
                dailyLimit: report.daily_limit,
                carryoverSpent: report.carryover.spent,
                carryoverAvailable: report.carryover.total_available,
                savingsSpent: report.expenses.savings_spent
            }
        });

        return res.status(201).send({
            success: true,
            closure
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).send({ message: 'This cycle is already closed.' });
        }

        return handleReportError(res, err);
    }
});

router.get('/closures', async (req, res) => {
    try {
        const closures = await CycleClosure.find({ user: req.userId })
            .sort({ cycleStart: -1 });

        return res.status(200).send({
            success: true,
            closures: closures.map(formatClosureListItem)
        });
    } catch (err) {
        return handleReportError(res, err);
    }
});

router.get('/closures/:closure_id', async (req, res) => {
    try {
        const closure = await CycleClosure.findOne({
            _id: req.params.closure_id,
            user: req.userId
        });

        if (!closure) {
            return res.status(404).send({ message: 'Cycle closure not found.' });
        }

        return res.status(200).send({
            success: true,
            closure
        });
    } catch (err) {
        return handleReportError(res, err);
    }
});

router.delete('/closures/:closure_id', async (req, res) => {
    try {
        const closure = await CycleClosure.findOne({
            _id: req.params.closure_id,
            user: req.userId
        });

        if (!closure) {
            return res.status(404).send({ message: 'Cycle closure not found.' });
        }

        await closure.deleteOne();

        return res.status(200).send({
            success: true
        });
    } catch (err) {
        return handleReportError(res, err);
    }
});

router.get('/summary', async (req, res) => {
    try {
        const { date_init, date_end } = req.query;
        const report = await getReportData(req.userId, date_init, date_end);

        return res.status(200).send(formatSummaryReport(report));
    } catch (err) {
        return handleReportError(res, err);
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const { date_init, date_end } = req.query;
        const report = await getReportData(req.userId, date_init, date_end);

        return res.status(200).send(formatLegacyReport(report));
    } catch (err) {
        return handleReportError(res, err);
    }
});

module.exports = app => app.use('/report', router);
