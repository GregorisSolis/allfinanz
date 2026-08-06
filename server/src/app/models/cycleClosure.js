const mongoose = require('../../database');

const TransactionSnapshotSchema = new mongoose.Schema({
    originalTransactionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction' },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
    category: { type: String, required: true },
    type: { type: String },
    date: { type: Date },
    fixed: { type: Boolean, default: false },
    observation: { type: String },
    isDivided: { type: Boolean, default: false },
    dividedIn: { type: Number, default: 0 },
    card: { type: String },
    source: {
        type: String,
        enum: ['salary', 'carryover', 'savings'],
        required: true
    },
    capturedAt: { type: Date, default: Date.now }
}, { _id: false });

const CycleClosureSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    cycleStart: { type: Date, required: true },
    cycleEnd: { type: Date, required: true },
    salaryDaySnapshot: { type: Number, required: true },
    salarySnapshot: { type: Number, required: true },
    fixedTransactionsSnapshot: [TransactionSnapshotSchema],
    variableTransactionsSnapshot: [TransactionSnapshotSchema],
    totals: {
        fixed: { type: Number, default: 0 },
        variable: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
        salaryBalance: { type: Number, default: 0 },
        dailyLimit: { type: Number, default: 0 },
        carryoverSpent: { type: Number, default: 0 },
        carryoverAvailable: { type: Number, default: 0 },
        savingsSpent: { type: Number, default: 0 }
    },
    status: { type: String, enum: ['closed'], default: 'closed' },
    closedAt: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
});

CycleClosureSchema.index({ user: 1, cycleStart: 1, cycleEnd: 1 }, { unique: true });

const CycleClosure = mongoose.model('CycleClosure', CycleClosureSchema);

module.exports = CycleClosure;
