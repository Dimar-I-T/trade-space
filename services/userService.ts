import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Item from '@/models/Item';

export async function getUserById(user_id: string) {
    try {
        await dbConnect();
        const user = await User.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }
        const { password, ...userData } = user._doc;
        return userData;
    } catch (error: any) {
        throw error.message;
    }
}

export async function addBalance(user_id: string, amount: number) {
    try {
        await dbConnect();

        if (!amount || typeof amount !== 'number' || amount <= 0) {
            throw new Error('Amount harus berupa angka positif');
        }

        const user = await User.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }

        user.balance += amount;
        await user.save();

        const { password, ...userData } = user._doc;
        return userData;
    } catch (error: any) {
        throw error.message;
    }
}

export async function getCart(user_id: string) {
    try {
        await dbConnect();
        const user = await User.findById(user_id).populate('cart.item_id');
        if (!user) {
            throw new Error('User not found');
        }
        return user.cart;
    } catch (error: any) {
        throw error.message;
    }
}

export async function updateCart(user_id: string, item_id: string, qty: number, price_snap: number) {
    try {
        await dbConnect();

        if (!item_id || qty === undefined || price_snap === undefined) {
            throw new Error('item_id, qty, dan price_snap wajib diisi');
        }

        if (qty <= 0) {
            throw new Error('qty harus lebih dari 0');
        }

        // Cek item ada
        const item = await Item.findById(item_id);
        if (!item) {
            throw new Error('Item tidak ditemukan');
        }

        // Cek stok cukup
        if (qty > item.stock) {
            throw new Error('Qty melebihi stok yang tersedia');
        }

        const user = await User.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }

        // Cek apakah item sudah ada di cart
        const existingCartItem = user.cart.find(
            (cartItem: any) => cartItem.item_id.toString() === item_id
        );

        if (existingCartItem) {
            existingCartItem.qty = qty;
            existingCartItem.price_snap = price_snap;
        } else {
            user.cart.push({ item_id, qty, price_snap });
        }

        await user.save();
        return user.cart;
    } catch (error: any) {
        throw error.message;
    }
}

export async function deleteCartItem(user_id: string, cart_item_id: string) {
    try {
        await dbConnect();

        const user = await User.findById(user_id);
        if (!user) {
            throw new Error('User not found');
        }

        const originalLength = user.cart.length;
        user.cart = user.cart.filter(
            (cartItem: any) => cartItem._id.toString() !== cart_item_id
        );

        if (user.cart.length === originalLength) {
            throw new Error('Item tidak ditemukan di cart');
        }

        await user.save();
        return user.cart;
    } catch (error: any) {
        throw error.message;
    }
}
