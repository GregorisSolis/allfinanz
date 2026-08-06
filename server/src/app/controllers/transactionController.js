const express = require('express')
const authMiddleware = require('../middlewares/auth')
const Transaction = require('../models/transaction')
const User = require('../models/user')

const { buildDateFilter, toDecimalFormat, formatToTwoDecimals } = require('../../core/utils');

const router = express.Router()

//CODIGO ENCARGADO DE QUE LAS Transaction SE HAGAN CON AUTH
router.use(authMiddleware)

function normalizeInstallments(payload, existing = {}) {
    const merged = { ...existing, ...payload };

    let dividedIn = merged.dividedIn;
    if (dividedIn === undefined || dividedIn === null || dividedIn === '') {
        dividedIn = 0;
    }
    dividedIn = Number(dividedIn);

    if (!Number.isFinite(dividedIn) || !Number.isInteger(dividedIn) || dividedIn < 0) {
        return { ok: false, error: 'Invalid dividedIn.' };
    }

    if (dividedIn === 1) {
        return { ok: false, error: 'Invalid dividedIn. Use 0 or >= 2.' };
    }

    const fixed = Boolean(merged.fixed);
    const isDivided = dividedIn >= 2;

    if (fixed && dividedIn > 0) {
        return { ok: false, error: 'Fixed transactions cannot have installments.' };
    }

    return {
        ok: true,
        normalized: {
            ...payload,
            fixed,
            dividedIn,
            isDivided
        }
    };
}

function getSalaryPeriod(salaryDay = 1) {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();

    let periodMonth = month;
    let periodYear = year;

    if (now.getDate() < salaryDay) {
        periodMonth = month - 1;

        if (periodMonth < 0) {
            periodMonth = 11;
            periodYear = year - 1;
        }
    }

    return {
        start: new Date(periodYear, periodMonth, salaryDay),
        end: new Date(periodYear, periodMonth + 1, salaryDay - 1, 23, 59, 59, 999)
    };
}

function normalizeDateRange(dateInit, dateEnd, salaryDay) {
    if (dateInit && dateEnd) {
        const filter = buildDateFilter(dateInit, dateEnd);
        return {
            filter,
            start: filter.date.$gte,
            end: filter.date.$lte
        };
    }

    const period = getSalaryPeriod(salaryDay);

    return {
        filter: buildDateFilter(period.start, period.end),
        start: period.start,
        end: period.end
    };
}

function sortByDateDesc(transactions) {
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

function sumTransactions(transactions) {
    return formatToTwoDecimals(
        transactions.reduce((total, transaction) => total + toDecimalFormat(transaction.amount), 0)
    );
}

function buildStatement(period, fixed, variable) {
    const fixedExpenses = fixed.filter(transaction => transaction.source === 'salary');
    const variableExpenses = variable.filter(transaction => transaction.source === 'salary');

    return {
        period: {
            start: period.start.toISOString().split('T')[0],
            end: period.end.toISOString().split('T')[0]
        },
        fixedExpenses: {
            total: sumTransactions(fixedExpenses),
            count: fixedExpenses.length,
            items: sortByDateDesc(fixedExpenses)
        },
        variableExpenses: {
            total: sumTransactions(variableExpenses),
            count: variableExpenses.length,
            items: sortByDateDesc(variableExpenses)
        },
        totalExpenses: sumTransactions([...fixedExpenses, ...variableExpenses])
    };
}


//CREAR UNA TRANSACCIÓN
router.post('/', async (req, res) => {
    let { amount, date } = req.body;

    if (amount === undefined || amount === null || amount === '') {
        return res.status(400).send({ message: 'Invalid amount.' });
    }

    req.body.amount = amount;

    if (req.body.isDivided === true) {
        req.body.dividedIn = req.body.dividedIn || 0;
    }

    if (!req.body.description || req.body.description.trim() === "") {
        return res.status(400).send({ message: 'Invalid description.' });
    }

    const installments = normalizeInstallments(req.body);
    if (!installments.ok) {
        return res.status(400).send({ message: installments.error });
    }
    req.body = installments.normalized;

    // Ajustar fecha a hora de Brasilia (UTC-3)
    if (date) {
        const inputDate = new Date(date);
        // Restar 3 horas para pasar UTC a BRT
        const brazilDate = new Date(inputDate.getTime() - 3 * 60 * 60 * 1000);
        req.body.date = brazilDate;
    } else {
        return res.status(400).send({ message: 'Invalid date.' });
    }

    try {
        const transaction = await Transaction.create({ ...req.body, user: req.userId });
        return res.send({ transaction });
    } catch (err) {
        return res.status(400).send({ message: 'Transaction failed.', error: err });
    }
});


//OBTENER LAS TRANSACCIONES DEL USUARIO AUTENTICADO
router.get('/list', async (req, res) => {
    try {
        const { date_init, date_end } = req.query;
        
        const user_id = req.userId;
        
        // Buscar usuário para obter o dia do salário
        const user = await User.findById(user_id);

        if (!user) {
            return res.status(404).send({ message: 'User not found.' });
        }
        
        const salary_day = user.salary_day || 1;
        const period = normalizeDateRange(date_init, date_end, salary_day);

        // Construção de query base
        const baseQuery = { user: user_id };

        // Consultas paralelas para melhor rendimento
        const [relatives, fixed] = await Promise.all([
            Transaction.find({
                ...baseQuery,
                fixed: false,
                ...period.filter
            }).sort({ date: -1 }),
            Transaction.find({
                ...baseQuery,
                fixed: true
            }).sort({ date: -1 })
        ]);

        return res.status(200).json({
            success: true,
            transactions: { relatives, fixed },
            statement: buildStatement(period, fixed, relatives)
        });

    } catch (err) {
        console.error('Error fetching transactions:', err);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error while fetching transactions" 
        });
    }
});


//BUSCAR TRANSACCIONES POR TIPO, CATEGORIA OU CARTÃO
router.get('/search', async (req, res) => {
    try {
        const { type, category, card, description, date_init, date_end, user_id } = req.query;

        if (!type && !category && !card && !description && !date_init && !date_end) {
            return res.status(400).send({ 
                message: "É necessário pelo menos um filtro" 
            });
        }

        const queryUser = user_id || req.userId;
        if (!queryUser) {
            return res.status(400).send({ 
                message: "user_id é obrigatório nos parâmetros" 
            });
        }

        let query = { user: queryUser };

        if (type) query.type = type;
        if (category) query.category = category;
        if (card) query.card = card;
        if (description) {
            query.description = { $regex: String(description).trim(), $options: 'i' };
        }
        if (date_init || date_end) {
            query = { ...query, ...buildDateFilter(date_init, date_end) };
        }

        const transactions = await Transaction.find(query);
        return res.send({ transactions });
    } catch (err) {
        return res.status(400).send({ message: "Erro ao buscar transações." });
    }
});


//EDITAR UNA TRANSACTION
router.get('/:transaction_id', authMiddleware, async (req, res) => {
    try {
        const user_id = req.userId;
        const transaction = await Transaction.findOne({ _id: req.params.transaction_id, user: user_id });

        if (!transaction) {
            return res.status(404).send({ message: 'Transação não encontrada para este usuário.' });
        }

        return res.send({ transaction });
    } catch (err) {
        return res.status(400).send({ message: 'Erro ao buscar transação.' });
    }
});

//EDITAR UNA TRANSACTION
router.patch('/:transaction_id', async (req, res) => {

	try {

        const existing = await Transaction.findOne({ _id: req.params.transaction_id, user: req.userId });
        if (!existing) {
            return res.status(404).send({ message: 'Transação não encontrada para este usuário.' });
        }

        const installments = normalizeInstallments(req.body, existing.toObject());
        if (!installments.ok) {
            return res.status(400).send({ message: installments.error });
        }

		const transaction = await Transaction.findOneAndUpdate(
            { _id: req.params.transaction_id, user: req.userId },
			{ ...installments.normalized, user: req.userId },
            { new: true }
        )

		return res.send({ transaction })

	} catch (err) {

		return res.status(400).send({ message: "Error updating transaction."})

	}
})


//ELIMINAR UNA TRANSACTION
router.delete('/:transaction_id', async (req, res) => {
	try {

		await Transaction.findByIdAndDelete(req.params.transaction_id)

		return res.send({ success: true })

	} catch (err) {
		return res.status(400).send({ message: 'Error deleting transaction.'})
	}
})

module.exports = app => app.use('/transaction', router)
