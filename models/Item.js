import mongoose from 'mongoose'

const ReviewSchema = new mongoose.Schema({
    from_user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },

    comment: {
        type: String
    },

    timestamp: {
        type: Date, 
        default: Date.now
    }
}, {_id: false})

const ItemSchema = new mongoose.Schema({
    seller_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    name: {
        type: String,
        required: true
    },

    category: {
        type: String,
        required: true
    },

    specs: {
        type: mongoose.Schema.Types.Mixed
    },

    price: {
        type: Number,
        required: true
    },

    stock: {
        type: Number,
        required: true,
        min: 0
    },

    condition: {
        type: String,
        required: true
    },

    average_rating: {
        type: Number,
        default: 0
    },

    reviews: [ReviewSchema]
}, {timestamps: true});

export default mongoose.models.Item || mongoose.model('Item', ItemSchema);