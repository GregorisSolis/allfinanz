const express = require('express');
const authMiddleware = require('../middlewares/auth');
const User = require('../models/user');
const Transaction = require('../models/transaction');
const { toDecimalFormat, formatToTwoDecimals } = require('../../core/utils');

const router = express.Router();

router.use(authMiddleware);

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

    const first_day_of_period = new Date(year, month, salary_day);
    const last_day_of_period = new Date(year, month + 1, salary_day - 1);

    if (isNaN(first_day_of_period.getTime()) || isNaN(last_day_of_period.getTime())) {
        throw new Error('Intervalo de datas inválido');
    }

    return {
        first_day_of_period,
        last_day_of_period,
        days_in_period: Math.ceil((last_day_of_period - first_day_of_period) / (1000 * 60 * 60 * 24)),
        today_day: now.getDate()
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
 * @returns {Object} Objeto com informações do carryover
 */
const calculateCarryover = (transactions, daily_limit, today_day) => {
    const accumulated_daily_limit = formatToTwoDecimals(daily_limit * today_day);
    const carryover_spent_until_today = transactions
        .filter(t => t.date.getDate() <= today_day && t.source === SOURCES.CARRYOVER)
        .reduce((acc, t) => acc + toDecimalFormat(t.amount), 0);

    const carryover_available = formatToTwoDecimals(
        accumulated_daily_limit - carryover_spent_until_today
    );

    return {
        spent: formatToTwoDecimals(
            transactions
                .filter(t => t.source === SOURCES.CARRYOVER)
                .reduce((acc, t) => acc + toDecimalFormat(t.amount), 0)
        ),
        balance: carryover_available,
        user_balance: carryover_available,
        total_available: carryover_available
    };
};

router.get('/', authMiddleware, async (req, res) => {
    try {
        const user_id = req.userId;

        // Buscar e validar usuário
        const user = await User.findById(user_id);
        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }
        if (!user.salary || user.salary <= 0) {
            return res.status(400).send({ message: 'Invalid salary value.' });
        }
        if (!user.salary_day || user.salary_day < MIN_SALARY_DAY || user.salary_day > MAX_SALARY_DAY) {
            return res.status(400).send({ message: 'Invalid salary day value.' });
        }

        // Calcular período
        const period = calculatePaymentPeriod(user.salary_day);
        
        // Buscar transações
        const transactions = await Transaction.find({
            user: user_id,
            date: {
                $gte: period.first_day_of_period,
                $lte: period.last_day_of_period
            }
        });

        const salary = toDecimalFormat(user.salary);
        const expenses = calculateExpenses(transactions);
        const salary_balance = formatToTwoDecimals(salary - expenses.total);
        const daily_limit = formatToTwoDecimals(salary_balance / period.days_in_period);
        const carryover = calculateCarryover(transactions, daily_limit, period.today_day);

        // Enviar relatório
        res.status(200).send({
                success: true,
                period: {
                    first_day_of_period: period.first_day_of_period.toISOString().split('T')[0],
                    last_day_of_period: period.last_day_of_period.toISOString().split('T')[0],
                    days_in_period: period.days_in_period,
                    today_day: period.today_day
                },
                salary: {
                    base: salary.toFixed(2),
                    balance: salary_balance,
                    daily_limit
                },
                expenses: {
                    fixed: expenses.fixed,
                    relative: expenses.relative,
                    total: expenses.total
                },
                carryover,
                savings: {
                    spent: expenses.savings_spent
                }
        });
    } catch (err) {
        return res.status(500).send({ message: 'Internal server error.' });
    }
});

module.exports = app => app.use('/report', router);
