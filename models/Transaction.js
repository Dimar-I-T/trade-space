import mongoose from 'mongoose';

const TransactionSchema = new mongoose.Schema({
    buyer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    item_snapshot: {
        name: {
            type: String,
            required: true
        },

        price_paid: {
            type: Number,
            required: true
        }
    },

    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled'],
        default: 'completed'
    },

    total_amount: {
        type: Number,
        required: true
    }
}, {timestamps: true})

export default mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema);