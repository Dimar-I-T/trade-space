import mongoose from 'mongoose'

const CategorySchema = new mongoose.Schema({
    name: {
        type: String, 
        required: true,
        unique: true
    },

    allowed_specs: [{
        type: String,
        required: true
    }] // maksudnya untuk kategori dengan name, maka specs yang bisa dimasukkan user adalah ini
});

export default mongoose.models.Category || mongoose.model('Category', CategorySchema);