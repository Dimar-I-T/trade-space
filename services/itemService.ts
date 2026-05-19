import dbConnect from "@/lib/mongodb";
import Item from '@/models/Item'

export async function createItem(user_id: string, name: string, description: string, category: string, specs: object, price: string, stock: string, condition: string) {
    try {
        await dbConnect();
        const priceNum = Number(price);
        const stockNum = Number(stock);

        const item = new Item({
            seller_id: user_id,
            name: name,
            description: description,
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

export async function getItems(search: string, by_rating: boolean, category: string, limit: string, item_id: string, by_price: string) {
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

        let queryBuilder = Item.find(query).sort(sortOptions);
        if (limit) {
            queryBuilder = queryBuilder.limit(Number(limit));
        }

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

export async function updateItemById(item_id: string, name: string, description: string, category: string, specs: object, price: string, stock: string, condition: string) {
    try {
        await dbConnect();
        const currentItem = await Item.findById(item_id);
        const priceNum = Number(price);
        const stockNum = Number(stock);
        currentItem.name = name;
        currentItem.description = description;
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