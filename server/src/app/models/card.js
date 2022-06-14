const mongoose = require('../../database')

const CardSchema = new mongoose.Schema({
	name: { type: String, required: true},
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
	color: { type: String, required: true, lowercase: true},
	colorFont: { type: String, required: true, lowercase: true},
	createdAt: { type: Date, default: Date.now },
	cardCloseDay:{ type: Number, default: 0 }
})

const Card = mongoose.model('Card', CardSchema)

module.exports = Card