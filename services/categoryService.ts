import Category from '@/models/Category'
import dbConnect from '../lib/mongodb';

export async function getCategories() {
    try {
        await dbConnect();
        const categories = await Category.find();
        return categories;
    } catch (error: any) {  
        throw error.message;
    }
}