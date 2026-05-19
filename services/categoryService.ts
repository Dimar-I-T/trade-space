import Category from '@/models/Category'
import dbConnect from '../lib/mongodb';

export async function getCategories(name: string) {
    try {
        await dbConnect();
        let query : any = {};
        if (name) {
            query.name = name;
        }

        const categories = await Category.find(query);
        return categories;
    } catch (error: any) {  
        throw error.message;
    }
}