const mongoose = require('../../database')

const TransactionSchema = new mongoose.Schema({
	value: { type: mongoose.Schema.Types.Decimal128, required: true },
	type: { type: String, required: true },
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	isDivided: { type: Boolean, default: false },
	dividedIn: { type: Number, default: 0},
	description: { type: String, required: true },
	category: { type: String, required: true },
	date: { type: Object, required: true},
	card: { type: String},
	createdAt: { type: Date, default: Date.now }
})

const Transaction = mongoose.model('Transaction', TransactionSchema)

module.exports = Transaction