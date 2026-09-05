const jwt = require('jsonwebtoken')

module.exports = (req, res, next) => {
	// Busca o token no cookie ou no header
	const authHeader = req.headers.authorization;
	const bearerToken = authHeader && authHeader.startsWith('Bearer ')
		? authHeader.slice(7)
		: null;
	const token = (req.cookies && req.cookies.token) || bearerToken;


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
