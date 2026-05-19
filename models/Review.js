import mongoose from 'mongoose'

export const ReviewSchema = new mongoose.Schema({
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
}, {_id: true});