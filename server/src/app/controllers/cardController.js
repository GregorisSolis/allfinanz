const express = require('express')
const authMiddleware = require('../middlewares/auth')
const Card = require('../models/card')

const router = express.Router()

//AUTH
router.use(authMiddleware)


//CREAR UNA TARJETA
router.post('/new-card', async (req, res) => {
	try {

		if (await Card.findOne({ name: req.body.name, user: req.userId })) {
			return res.send({ message: 'Card already exists.' })
		}

		const card = await Card.create({ ...req.body, user: req.userId })

		return res.send({ card })
	}
	catch (err) {
		return res.status(400).send({ message: 'Card failed.' })
	}
})


//MUESTRA TODAS LAS TARJETAS DEL USUARIO
router.get('/all-card/user', authMiddleware, async (req, res) => {
	try {
		const user_id = req.userId;
		const card = await Card.find({ user: user_id }).populate('user');
		return res.send({ card });
	} catch (err) {
		return res.status(400).send({ message: "Error loading card." });
	}
})

//MUESTRA TARJETA DEL USUARIO
router.get('/card-data/:nameCard/user', authMiddleware, async (req, res) => {
	try {
		const user_id = req.userId;
		const card = await Card.find({ user: user_id, name: req.params.nameCard }).populate('user');
		return res.send({ card });
	} catch (err) {
		return res.status(400).send({ message: "Error loading card." });
	}
})

//EDITAR UNA TARJETA
router.patch('/edit-card/:id', async (req, res) => {

	try {

		const card = await Card.findByIdAndUpdate(req.params.id,
			{ ...req.body, user: req.userId }, { new: true })

		return res.send({ card })

	} catch (err) {

		return res.status(400).send({ message: "Error updating card." + err })
	}
})


//ELIMINAR UNA TARJETA
router.delete('/remove-card/:id', async (req, res) => {
	try {
		const card = await Card.findByIdAndDelete(req.params.id);
		if (!card) {
			return res.status(404).send({ message: 'Card not found.' });
		}
		return res.send({ message: 'Card deleted successfully.' });
	} catch (err) {
		return res.status(400).send({ message: 'Error deleting card.' });
	}
})

// NOVO ENDPOINT: Retorna todas as cartas do usuário com totalCost do mês atual
router.get('/all-card/user/with-total', authMiddleware, async (req, res) => {
	try {
		const user_id = req.userId;
		const cards = await Card.find({ user: user_id });
		if (!cards.length) return res.send({ cards: [] });

		// Datas do mês atual
		const now = new Date();
		const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
		const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

		// Buscar todas as transações do usuário no mês atual e fixas sem data
		const Transaction = require('../models/transaction');
		const allTransactions = await Transaction.find({
			user: user_id,
			$or: [
				{ date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth } },
				{ fixed: true, date: { $exists: false } }
			]
		});

		// Agrupar por cartão
		const cardTotals = {};
		for (const card of cards) {
			cardTotals[card._id.toString()] = 0;
		}
		for (const tx of allTransactions) {
			// Só soma se a transação tem cartão associado
			if (tx.card) {
				// Procurar cartão pelo ID (como está no schema Transaction)
				const cardId = tx.card.toString();
				if (cardTotals.hasOwnProperty(cardId)) {
					cardTotals[cardId] += tx.amount;
				}
			}
		}

		// Montar resposta
		const cardsWithTotal = cards.map(card => ({
			...card.toObject(),
			totalCost: cardTotals[card._id.toString()] || 0
		}));

		return res.send({ cards: cardsWithTotal });
	} catch (err) {
		return res.status(400).send({ message: "Erro ao calcular totalCost das cartas.", error: err.message });
	}
});

module.exports = app => app.use('/card', router)