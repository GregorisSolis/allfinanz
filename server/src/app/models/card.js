const mongoose = require('../../database')

const CardSchema = new mongoose.Schema({
	name: { type: String, required: true, lowercase: true},
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	color: { type: String, required: true, lowercase: true},
	colorFont: { type: String, required: true, lowercase: true},
	createdAt: { type: Date, default: Date.now }
})

const Card = mongoose.model('Card', CardSchema)

module.exports = Card