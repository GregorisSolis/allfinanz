const express = require('express')
const authMiddleware = require('../middlewares/auth')
const Transaction = require('../models/transaction')

const numberFormat = require('../../core/utils');


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



//OBTENER LAS TRANSACCIONES ESPESIFICADA POR USUARIO
router.get('/user/:user_id', async (req, res) => {
    try {
        const transactions = await Transaction.find({ user: req.params.user_id })
        return res.send({ transactions })
    }
    catch (err) {
        return res.status(400).send({ message: "Transactions not found."})
    }
})


//BUSCAR TRANSACCIONES POR TIPO, CATEGORIA OU CARTÃO
router.get('/search', async (req, res) => {
    try {
        const type = req.headers.type;
        const category = req.headers.category;
        const card = req.headers.card;
        const user_id = req.headers.user_id;

        if (!user_id) {
            return res.status(400).send({ 
                message: "user_id é obrigatório nos headers" 
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
})

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

		return res.send()

	} catch (err) {
		return res.status(400).send({ message: 'Error deleting transaction.'})
	}
})

module.exports = app => app.use('/transaction', router)