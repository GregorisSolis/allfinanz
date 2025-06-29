const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
	// Busca o token no cookie ou no header
	const token = req.cookies && req.cookies.token;


	if (!token) {
		return res.status(401).send({ error: 'No token provided.' })
	}

	jwt.verify(token, process.env.SECRET_APP, (err, decoded) => {
		if (err) {
			return res.status(401).send({ error: 'Token invalid' })
		}

		req.userId = decoded.id
		return next()
	})
}