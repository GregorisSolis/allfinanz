const express = require('express')
const authMiddleware = require('../middlewares/auth')
const Transaction = require('../models/transaction')

const numberFormat = require('../../core/utils');


const router = express.Router()

//CODIGO ENCARGADO DE QUE LAS Transaction SE HAGAN CON AUTH
router.use(authMiddleware)


//CREAR UNA TRANSACCIÓN
router.post('/new-transaction', async (req, res) => {

	let { value } = req.body

	if (value !== undefined && value !== null && value !== '') {
		value = numberFormat(value);
		req.body.value = value;
	} else {
		return res.status(400).send({ message: 'Invalid value.' });
	}

	if (req.body.isDivided === true) {
		req.body.dividedIn = req.body.dividedIn || 0;
	}

	if (!req.body.description || req.body.description.trim() === "") {
		return res.status(400).send({ message: 'Invalid description.' });
	}

	try {

		const transaction = await Transaction.create({ ...req.body, user: req.userId })

		return res.send({ transaction })
	}
	catch (err) {
		return res.status(400).send({ message: 'Transaction failed.', error: err})
	}
})


//OBTENER LAS TRANSACCIONES ESPESIFICADA POR USUARIO
router.get('/all-transaction/user/:IDUSER', async (req, res) => {
	try {
		const transactions = await Transaction.find({ user: req.params.IDUSER })

		return res.send({ transactions })
	}
	catch (err) {
		return res.status(400).send({ message: "Transactions not found."})
	}
})


//BUSCAR TRANSACCIONES USANDO PALABRA LLAVE "type"
router.get('/all-transaction/type/:type/userId/:userId', async (req, res) => {
	try {
		const transactions = await Transaction.find({ type: req.params.type, user: req.params.userId })

		return res.send({ transactions })
	}
	catch (err) {
		return res.status(400).send({ message: "Transaction not found." })
	}
})

//BUSCAR TRANSACCIONES USANDO PALABRA LLAVE "category"
router.get('/all-transaction/category/:category/userId/:userId', async (req, res) => {
	try {
		const transactions = await Transaction.find({ category: req.params.category, user: req.params.userId })

		return res.send({ transactions })
	}
	catch (err) {
		return res.status(400).send({ message: "Transaction not found."})
	}
})


//MUESTRA TODAS LAS TRANSACCIONES DEL USUARIO POR TARJETA
router.get('/all-transaction/user/:userId/card/:nameCard', async (req, res) => {

	try {

		const transactions = await Transaction.find({ card: req.params.nameCard, user: req.userId }).populate('user')

		return res.send({ transactions })

	} catch (err) {
		return res.status(400).send({ message: "Error loading transactions."})
	}

})


//EDITAR UNA TRANSACTION
router.patch('/edit-transaction/:transactionId', async (req, res) => {

	try {

		const transaction = await Transaction.findByIdAndUpdate(req.params.transactionId,
			{ ...req.body, user: req.userId }, { new: true })

		return res.send({ transaction })

	} catch (err) {

		return res.status(400).send({ message: "Error updating transaction."})

	}
})


//ELIMINAR UNA TRANSACTION
router.delete('/romeve-transaction/:transactionId', async (req, res) => {
	try {

		await Transaction.findByIdAndDelete(req.params.transactionId)

		return res.send()

	} catch (err) {
		return res.status(400).send({ message: 'Error deleting transaction.'})
	}
})

module.exports = app => app.use('/operation', router)