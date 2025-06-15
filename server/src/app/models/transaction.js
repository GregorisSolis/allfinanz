const mongoose = require('../../database');

const TransactionSchema = new mongoose.Schema({
    amount:         { type: Number, required: true },
    description:    { type: String, required: true },
    category:       { type: String, required: true },

    type:           { type: String },

    date:           { type: Date, required: true },

    fixed:          { type: Boolean, default: false },
    observation:    { type: String },

    user:           { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    isDivided:      { type: Boolean, default: false },
    dividedIn:      { type: Number, default: 0 },

    card:           { type: String },

    source:         { 
        type: String, 
        enum: ['salary', 'carryover', 'savings'], 
        required: true 
    },

    createdAt:      { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', TransactionSchema);

module.exports = Transaction;
