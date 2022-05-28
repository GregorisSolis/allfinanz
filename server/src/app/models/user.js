const mongoose = require('../../database')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
	name: { type: String, required: true },
	email: { type: String, required: true, unique: true, lowercase: true },
	password: { type: String, required: true, select: false },
	createdAt: { type: Date, default: Date.now },
	savings: { type: mongoose.Schema.Types.Decimal128, default: 0 },
	monthlyIconme: { type: mongoose.Schema.Types.Decimal128, default: 0 },
	passwordResetToken: { type: String, select: false },
	passwordResetExpires: { type: Date, select: false },
	imageUrl: String,
	imageID: String,
	amountCard: { type: Number, default: 0 },
	amountTransaction: { type: Number, default: 0 }
})

UserSchema.pre('save', async function (next) {
	const hash = await bcrypt.hash(this.password, 10)
	this.password = hash

	next()
})

const User = mongoose.model('User', UserSchema)

module.exports = User