import mongoose from 'mongoose';

const CartSchema = new mongoose.Schema({
    item_id: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Item',
        required: true
    },

    qty: {
        type: Number,
        required: true
    },

    price_snap: {
        type: Number,
        required: true
    }
})

const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: true,
    },

    is_verified: {
        type: Boolean,
        default: false,
    },

    balance: {
        type: Number,
        default: 0,
    },

    cart: {
        type: [CartSchema]
    }
}, {timestamps: true});

export default mongoose.models.User || mongoose.model('User', UserSchema);