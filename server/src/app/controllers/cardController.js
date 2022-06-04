const express = require('express')
const authMiddleware = require('../middlewares/auth')
const Card = require('../models/card')

const router = express.Router()

//AUTH
router.use(authMiddleware)


//CREAR UNA TARJETA
router.post('/new-card', async (req, res) => {
	try {

		if(await Card.findOne({ name: req.body.name })) {
			return res.send({ message: 'Card already exists.'})
		}

		const card = await Card.create({ ...req.body, user: req.userId })

		return res.send({ card })
	}
	catch (err) {
		return res.status(400).send({ message: 'Card failed. '})
	}
})


//MUESTRA TODAS LAS TARJETAS DEL USUARIO
router.get('/all-card/user/:userId', async (req, res) => {

	try {

		const card = await Card.find({ user: req.params.userId }).populate('user')

		return res.send({ card })

	} catch (err) {
		return res.status(400).send({ message: "Error loading card." })
	}
})

//MUESTRA TARJETA DEL USUARIO
router.get('/card-data/:nameCard/user/:userId', async (req, res) => {

	try {

		const card = await Card.find({ user: req.params.userId, name: req.params.nameCard }).populate('user')

		return res.send({ card })

	} catch (err) {
		return res.status(400).send({ message: "Error loading card." })
	}
})

//EDITAR UNA TARJETA
router.patch('/edit-card/:id', async (req, res) => {

	try{

		const card = await Card.findByIdAndUpdate(req.params.id,
			{ ...req.body, user: req.userId }, { new: true })

		return res.send({ card })

	}catch(err){

		return res.status(400).send({ message: "Error updating card." + err})
	}
})


//ELIMINAR UNA TARJETA
router.delete('/remove-card/:cardId', async (req, res) => {
	try {

		await Card.findByIdAndRemove(req.params.cardId)

		return res.send()

	} catch (err) {
		return res.status(400).send({ message: 'Error deleting card.'})
	}
})

module.exports = app => app.use('/card', router)