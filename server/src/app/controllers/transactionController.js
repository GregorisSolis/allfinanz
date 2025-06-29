const express = require('express')
const authMiddleware = require('../middlewares/auth')
const Transaction = require('../models/transaction')

const { buildDateFilter } = require('../../core/utils');

const router = express.Router()

//CODIGO ENCARGADO DE QUE LAS Transaction SE HAGAN CON AUTH
router.use(authMiddleware)


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
        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

        // Construcción de query base
        const baseQuery = { user: user_id };

        // Construcción de filtro de fechas si se proporcionan
        const dateFilter = buildDateFilter(date_init, date_end);
        
        // Consultas paralelas para mejor rendimiento
        const [relatives, fixed] = await Promise.all([
            Transaction.find({ 
                ...baseQuery, 
                fixed: false,
                ...dateFilter 
            }),
            Transaction.find({ 
                ...baseQuery, 
                fixed: true 
            })
        ]);

        return res.status(200).json({ 
            success: true,
            transactions: { relatives, fixed }
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
        const { type, category, card, user_id } = req.query;

        if (!user_id) {
            return res.status(400).send({ 
                message: "user_id é obrigatório nos parâmetros" 
            });
        }

        if (!type && !category && !card) {
            return res.status(400).send({ 
                message: "É necessário pelo menos um filtro: type, category ou card" 
            });
        }

        let query = { user: user_id };

        if (type) query.type = type;
        if (category) query.category = category;
        if (card) query.card = card;

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

		const transaction = await Transaction.findByIdAndUpdate(req.params.transaction_id,
			{ ...req.body, user: req.userId }, { new: true })

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