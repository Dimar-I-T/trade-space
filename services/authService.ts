import dbConnect from '../lib/mongodb';
import bcrypt from 'bcrypt';
import User from '@/models/User'

export async function register(username: string, email: string, password: string) {
    try {
        await dbConnect();
        const hashed = await bcrypt.hash(password, 10);
        const user = new User({
            username: username,
            email: email,
            password: hashed
        });

        await user.save();
        const {password: string, ...userData} = user._doc;
        return userData;
    } catch (error: any) {
        let errorMessage : string = error.message;
        if (errorMessage.startsWith('E11000')) {
            errorMessage = 'Email already registered'; 
        }

        throw errorMessage;
    }
}

export async function login(email: string, password: string) {
    try {
        await dbConnect();
        const user = await User.findOne({ email: email });
        if (!user) {
            throw Error('Email tidak ditemukan!');
        }

        const benar = await bcrypt.compare(password, user.password);
        if (!benar) {
            throw Error('Password salah!');
        }

        return {_id: user._id};
    } catch (error: any) {
        throw error.message
    }
}

export async function getUserById(id: string) {
    try {   
        await dbConnect();
        const user = await User.findById(id);
        const {password, ...userData} = user._doc;
        return userData;
    } catch (error: any) {
        throw error.message;
    }
}