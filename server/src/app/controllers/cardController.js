const express = require('express')
const authMiddleware = require('../middlewares/auth')
const Card = require('../models/card')
const User = require('../models/user')

const router = express.Router()

//AUTH
router.use(authMiddleware)


//CREAR UNA TARJETA
router.post('/new-card', async (req, res) => {
	try {
		if (!req.body.name || req.body.name.trim() === "") {
			return res.status(400).send({ message: 'Invalid card name.' });
		}

		if (await Card.findOne({ name: req.body.name, user: req.userId })) {
			return res.status(400).send({ message: 'Card already exists.' });
		}

		const card = await Card.create({ ...req.body, user: req.userId });

		return res.status(201).send({ card });
	}
	catch (err) {
		return res.status(500).send({ message: 'Card creation failed.' });
	}
})


//MUESTRA TODAS LAS TARJETAS DEL USUARIO
router.get('/all-card/user', authMiddleware, async (req, res) => {
	try {
		const user_id = req.userId;
		const cards = await Card.find({ user: user_id }).populate('user');
		return res.status(200).send({ cards });
	} catch (err) {
		return res.status(500).send({ message: "Error loading cards." });
	}
})

//MUESTRA TARJETA DEL USUARIO
router.get('/card-data/:nameCard/user', authMiddleware, async (req, res) => {
	try {
		const user_id = req.userId;
		const cards = await Card.find({ user: user_id, name: req.params.nameCard }).populate('user');
		return res.status(200).send({ cards });
	} catch (err) {
		return res.status(500).send({ message: "Error loading card." });
	}
})

//EDITAR UNA TARJETA
router.patch('/edit-card/:id', async (req, res) => {
	try {
		const card = await Card.findByIdAndUpdate(req.params.id,
			{ ...req.body, user: req.userId }, { new: true });

		if (!card) {
			return res.status(404).send({ message: 'Card not found.' });
		}

		return res.status(200).send({ card });
	} catch (err) {
		return res.status(500).send({ message: "Error updating card." });
	}
})


//ELIMINAR UNA TARJETA
router.delete('/remove-card/:id', async (req, res) => {
	try {
		const card = await Card.findByIdAndDelete(req.params.id);
		if (!card) {
			return res.status(404).send({ message: 'Card not found.' });
		}
		return res.status(200).send({ message: 'Card deleted successfully.' });
	} catch (err) {
		return res.status(500).send({ message: 'Error deleting card.' });
	}
})

// NOVO ENDPOINT: Retorna todas as cartas do usuário com totalCost do período do salário
router.get('/all-card/user/with-total', authMiddleware, async (req, res) => {
	try {
		const user_id = req.userId;
		
		// Buscar usuário para obter o dia do salário
		const user = await User.findById(user_id);
		if (!user) {
			return res.status(404).send({ message: 'User not found.' });
		}

		// Validar se o usuário tem salário e dia do salário configurados
		if (!user.salary || user.salary <= 0) {
			return res.status(400).send({ message: 'Invalid salary value.' });
		}
		if (!user.salary_day || user.salary_day < 1 || user.salary_day > 31) {
			return res.status(400).send({ message: 'Invalid salary day value.' });
		}

		const cards = await Card.find({ user: user_id });
		if (!cards.length) return res.send({ cards: [] });

		// Calcular período baseado no dia do salário (lógica consistente com reportController)
		const salary_day = user.salary_day;
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth();
		const today = now.getDate();

		let firstDayOfPeriod, lastDayOfPeriod;

		// Se hoje é antes do dia do salário, estamos no período anterior
		// Se hoje é no dia do salário ou depois, estamos no período atual
		if (today < salary_day) {
			// Período anterior: do dia do salário do mês anterior até o dia anterior ao salário deste mês
			const previousMonth = month === 0 ? 11 : month - 1;
			const previousYear = month === 0 ? year - 1 : year;
			
			firstDayOfPeriod = new Date(previousYear, previousMonth, salary_day);
			lastDayOfPeriod = new Date(year, month, salary_day - 1, 23, 59, 59, 999);
		} else {
			// Período atual: do dia do salário deste mês até o dia anterior ao salário do próximo mês
			firstDayOfPeriod = new Date(year, month, salary_day);
			lastDayOfPeriod = new Date(year, month + 1, salary_day - 1, 23, 59, 59, 999);
		}

		if (isNaN(firstDayOfPeriod.getTime()) || isNaN(lastDayOfPeriod.getTime())) {
			return res.status(400).send({ message: 'Invalid date range.' });
		}

		// Buscar todas as transações do usuário separadas em relatives e fixed
		const Transaction = require('../models/transaction');
		const relatives = await Transaction.find({
			user: user_id,
			fixed: false,
			date: { $gte: firstDayOfPeriod, $lte: lastDayOfPeriod }
		});
		const fixed = await Transaction.find({
			user: user_id,
			fixed: true
		});

		// Agrupar por cartão
		const cardTotals = {};
		for (const card of cards) {
			cardTotals[card._id.toString()] = 0;
		}
		for (const tx of [...relatives, ...fixed]) {
			// Só soma se a transação tem cartão associado
			if (tx.card) {
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

		return res.send({ 
			cards: cardsWithTotal, 
			transactions: { relatives, fixed },
			period: {
				start: firstDayOfPeriod,
				end: lastDayOfPeriod,
				salary_day: salary_day,
				today_day: today
			}
		});
	} catch (err) {
		return res.status(500).send({ message: "Erro ao calcular totalCost das cartas.", error: err.message });
	}
});

module.exports = app => app.use('/card', router)