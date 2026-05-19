import dbConnect from "@/lib/mongodb";
import Item from '@/models/Item'
import { uploadPicture } from "./uploadPicture";

export async function createItem(user_id: string, name: string, description: string, category: string, specs: object, price: string, stock: string, condition: string, file: File) {
    try {
        await dbConnect();
        if (!file) {
            throw Error('No file uploaded');
        }

        const image_url = await uploadPicture(file);
        const priceNum = Number(price);
        const stockNum = Number(stock);

        console.log("type: " + typeof specs);
        console.log(specs);

        const item = new Item({
            seller_id: user_id,
            name: name,
            description: description,
            picture_url: image_url,
            category: category,
            specs: specs,
            price: priceNum,
            stock: stockNum,
            condition: condition
        });

        await item.save();
        return item;
    } catch (error: any) {
        throw error.message;
    }
}

export async function getItems(search: string, by_rating: boolean, category: string, limit: string, item_id: string, by_price: string, page: string) {
    try {
        await dbConnect();
        if (item_id) {
            const item = await Item.findById(item_id).lean();
            if (!item) {
                throw new Error("Item not found");
            }

            return item;
        }

        const query: any = {};

        if (search) {
            query.name = { $regex: search, $options: 'i' };
        }

        if (category) {
            query.category = category;
        }

        const sortOptions: any = {};

        if (by_price === 'asc') {
            sortOptions.price = 1;
        } else if (by_price === 'desc') {
            sortOptions.price = -1;
        }

        if (by_rating) {
            sortOptions.rating = -1;
        }

        if (Object.keys(sortOptions).length === 0) {
            sortOptions.createdAt = -1;
        }

        const pageSize = limit ? Number(limit) : 8;
        const currentPage = page ? Number(page) : 1;
        const skip = (currentPage - 1) * pageSize;
        let queryBuilder = Item.find(query)
            .sort(sortOptions)
            .skip(skip)
            .limit(pageSize);

        const items = await queryBuilder.lean().exec();
        return items;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export async function getItemById(item_id: string) {
    try {
        await dbConnect();
        const item = await Item.findById(item_id);
        if (!item) {
            throw Error('Item not found!');
        }

        return item;
    } catch (error: any) {
        throw error.message;
    }
}

export async function updateItemById(item_id: string, name: string, description: string, category: string, specs: object, price: string, stock: string, condition: string, file: File, existing_url: string) {
    try {
        await dbConnect();
        let finalImageUrl;
        if (file instanceof File && file.size > 0) {
            finalImageUrl = await uploadPicture(file);
        } else {
            finalImageUrl = existing_url;
        }

        const currentItem = await Item.findById(item_id);
        if (!currentItem) {
            throw Error('Item tidak ditemukan');
        }
        
        const priceNum = Number(price);
        const stockNum = Number(stock);
        currentItem.name = name;
        currentItem.description = description;
        currentItem.picture_url = finalImageUrl;
        currentItem.category = category;
        currentItem.specs = specs;
        currentItem.price = priceNum;
        currentItem.stock = stockNum;
        currentItem.condition = condition;

        await currentItem.save();
        return currentItem;
    } catch (error: any) {
        throw error.message;
    }
}

export async function deleteItemById(item_id: string) {
    try {
        await dbConnect();
        const result = await Item.findByIdAndDelete(item_id);
        if (!result) {
            throw Error('Item not found');
        }

        return result;
    } catch (error: any) {
        throw error.message;
    }
}