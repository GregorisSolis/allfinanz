const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const mailer = require('../../modules/mailer')

const User = require('../models/user')
const UserGoogle = require('../models/userGoogle')
const authMiddleware = require('../middlewares/auth')

const router = express.Router()

function generateToken(params = {}) {
	return jwt.sign(params, process.env.SECRET_APP, {
		expiresIn: 86400, //24h
	})
}


//REGISTER USER
router.post('/register', async (req, res) => {

	const { email, password } = req.body

	try {

		if (await UserGoogle.findOne({ email }) || await User.findOne({ email })) {

			return res.status(400).send({ message: 'User already exists.' })

		} else if (password.length < 8) {
			return res.status(400).send({ message: 'Short password.' })
		}

		const user = await User.create(req.body)

		user.password = undefined

		return res.send({
			user,
			token: generateToken({ id: "Registration Failed." })
		})
	}
	catch (err) {
		return res.status(400).send({ message: "Registration Failed." + err })
	}

})

//AUTHENTICAR USER
router.post('/authenticate', async (req, res) => {

	const { email, password } = req.body

	const user = await User.findOne({ email }).select('+password')

	if (!user) {
		return res.status(400).send({ message: 'User not found' })
	}

	if (!await bcrypt.compare(password, user.password)) {
		return res.status(400).send({ message: 'Invalid password' })
	}

	user.password = undefined
	const token = generateToken({ id: user.id })

	res.cookie('token', token, {
		httpOnly: true,
		sameSite: 'lax',
		maxAge: 8 * 60 * 60 * 1000 // 8 horas
	});

	res.send({ user })
})

//MOSTRAR LA INFORMACION DEL USER
router.get('/info-user', authMiddleware, async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		return res.send({ user });
	} catch (err) {
		return res.status(400).send({ message: 'Error loanding user info.' });
	}
});

//recuperar la contrasena - enviar email para user
router.post('/forgot_password', async (req, res) => {
	const { email } = req.body

	try {

		const user = await User.findOne({ email })

		if (!user) {
			return res.status(400).send({ message: "User not found" })
		}

		const token = crypto.randomBytes(20).toString('hex')

		const now = new Date()
		now.setHours(now.getHours() + 1)

		await User.findByIdAndUpdate(user.id, {
			'$set': {
				passwordResetToken: token,
				passwordResetExpires: now,
			}
		})

		mailer.sendMail({
			to: email,
			from: process.env.EMAIL_ALLFINANZ,
			template: '/forgot_password',
			subject: 'ALLFINANZ - Reset password',
			context: { token, email: email.replace('.com','') }

		}, (err) => {
			if (err) {
				return res.status(400).send({ message: 'Cannot send forgot password email' })
			}

			return res.send()
		})
	}


	catch (err) {
		res.status(400).send({ message: 'message on forgot password, try again' })
	}
})

//recuperar la contrasena - enviando la nueva contrasena
router.post('/reset_password', async (req, res) => {

	const { email, token, password } = req.body

	try {

		const user = await User.findOne({ email })
			.select('+passwordResetToken passwordResetExpires')

		if (!user) {
			return res.status(400).send({ message: "User not found" })
		}

		if (token !== user.passwordResetToken) {
			return res.status(400).send({ message: "Token Invalid" })
		}

		const now = new Date()

		if (now > user.passwordResetExpires) {
			return res.status(400).send({ message: "Token expired, generate a new one" })
		}

		user.password = password

		await user.save()

		res.send()
	}
	catch (err) {
		res.status(400).send({ message: 'Cannot reset password, try again' })
	}
})


//EDITAR PASS USER
router.put('/edit_password', authMiddleware, async (req, res) => {
	const { password } = req.body;
	try {
		const user = await User.findById(req.userId).select('+password');
		if (!user) {
			return res.status(400).send({ message: 'user not found' });
		}
		user.password = password;
		await user.save();
		res.send({ user });
	} catch (err) {
		res.status(400).send({ Error: err });
	}
});

//EDITAR DATOS USER - funciona tambien para usuarios de google
router.put('/edit', authMiddleware, async (req, res) => {
	try {
		const user = await User.findByIdAndUpdate(req.userId, { ...req.body }, { new: true });
		if (user === null) {
			const userGoogle = await UserGoogle.findByIdAndUpdate(req.userId, { ...req.body }, { new: true });
			res.send({ userGoogle });
		} else {
			res.send({ user });
		}
	} catch (err) {
		res.status(400).send({ message: 'Error updating user.' });
	}
});

//EDITAR CARRYOVER USER
router.put('/edit-carryover', authMiddleware, async (req, res) => {
	try {
		const { carryover } = req.body;
		if (carryover === undefined || carryover < 0) {
			return res.status(400).send({ 
				message: 'Carryover inválido. Deve ser um valor positivo.' 
			});
		}
		const user = await User.findByIdAndUpdate(
			req.userId,
			{ carryover: carryover },
			{ new: true }
		);
		if (!user) {
			const userGoogle = await UserGoogle.findByIdAndUpdate(
				req.userId,
				{ carryover: carryover },
				{ new: true }
			);
			if (!userGoogle) {
				return res.status(404).send({ message: 'Usuário não encontrado.' });
			}
			return res.send({ userGoogle });
		}
		res.send({ user });
	} catch (err) {
		res.status(400).send({ 
			message: 'Erro ao atualizar carryover do usuário.',
			error: err.message 
		});
	}
});


// Verificar se o token JWT é válido
router.get('/auth-check', authMiddleware, (req, res) => {
	return res.status(200).send({ success: true, message: "Usuário autenticado." });
});

// Endpoint para logout (limpar o cookie)
router.post('/logout', (req, res) => {
	res.clearCookie('token');
	res.send({ message: 'Logout realizado com sucesso.' });
});

module.exports = app => app.use('/user', router)