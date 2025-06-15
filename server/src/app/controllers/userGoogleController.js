const express = require('express')
const jwt = require('jsonwebtoken')

const User = require('../models/user')
const UserGoogle = require('../models/userGoogle')

const router = express.Router()

function generateToken(params = {}) {
	return jwt.sign(params, process.env.SECRET_APP, {
		expiresIn: 86400,
	})
}


//REGISTER USER
router.post('/google/register', async (req, res) => {

	const { email } = req.body

	try {

		if (await UserGoogle.findOne({ email }) || await User.findOne({ email })) {
			return res.status(400).send({ error: 'User already exists.' })
		}

		const user = await UserGoogle.create(req.body)

		return res.send({
			user,
			token: generateToken({ id: "Registration Failed." })
		})
	}
	catch (err) {
		return res.status(400).send({ error: "Registration Failed."})
	}

})


//INFO USER auth
router.get('/google-user/user/:userId', async (req, res) => {

	try {
		const user = await UserGoogle.findOne({ googleId: req.params.userId })

		return res.send({
			user,
			token: generateToken({ id: user.id })
		})

	}
	catch (err) {
		return res.status(400).send({ error: 'error loanding user info.' })
	}
})


//INFO USER profile
router.get('/google/profile/:userId', async (req, res) => {

	try {
		const user = await UserGoogle.findOne({ _id: req.params.userId })

		return res.send({
			user,
			token: generateToken({ id: user.id })
		})

	}
	catch (err) {
		return res.status(400).send({ error: 'error loanding user info.' })
	}
})

//EDITAR LA DATA DEL USERGOOGLE
router.put('/google/info-edit/:userId', async (req, res) => {

	const body = req.body

	try {

		const user = await UserGoogle.findByIdAndUpdate(req.params.userId, body, { new: true })

		res.json(user)

	}
	catch (err) {
		return res.status(400).json('Error updating user')
	}

})

module.exports = app => app.use('/auth', router)