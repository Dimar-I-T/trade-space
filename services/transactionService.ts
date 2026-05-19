import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Item from '@/models/Item';
import Transaction from '@/models/Transaction';

export async function checkout(buyer_id: string, item_id: string) {
    try {
        await dbConnect();

        // Ambil data buyer
        const buyer = await User.findById(buyer_id);
        if (!buyer) {
            throw new Error('User not found');
        }

        // Cari item di cart buyer
        const cartItem = buyer.cart.find(
            (ci: any) => ci.item_id.toString() === item_id
        );

        if (!cartItem) {
            throw new Error('Item tidak ditemukan di cart');
        }

        // Ambil data item dari database
        const item = await Item.findById(item_id);
        if (!item) {
            throw new Error('Item tidak ditemukan');
        }

        const totalAmount = cartItem.price_snap * cartItem.qty;

        // Cek balance cukup
        if (buyer.balance < totalAmount) {
            throw new Error(`Balance tidak cukup. Dibutuhkan ${totalAmount}, balance Anda ${buyer.balance}`);
        }

        // Cek stok masih ada
        if (item.stock < cartItem.qty) {
            throw new Error(`Stok tidak cukup. Tersisa ${item.stock}, dibutuhkan ${cartItem.qty}`);
        }

        // 1. Potong balance pembeli
        buyer.balance -= totalAmount;

        // 2. Tambah balance penjual
        await User.findByIdAndUpdate(
            item.seller_id,
            { $inc: { balance: totalAmount } }
        );

        // 3. Kurangi stock
        item.stock -= cartItem.qty;
        await item.save();

        // 4. Tambahkan data snapshotting (buat transaksi)
        const transaction = await Transaction.create({
            buyer_id: buyer._id,
            seller_id: item.seller_id,
            item_snapshot: {
                name: item.name,
                price_paid: cartItem.price_snap
            },
            status: 'completed',
            total_amount: totalAmount
        });

        // 5. Hapus item dari cart
        buyer.cart = buyer.cart.filter(
            (ci: any) => ci.item_id.toString() !== item_id
        );
        await buyer.save();

        return transaction;
    } catch (error: any) {
        throw error.message;
    }
}

export async function getTransactions(user_id: string) {
    try {
        await dbConnect();

        const transactions = await Transaction.find({
            $or: [
                { buyer_id: user_id },
                { seller_id: user_id }
            ]
        }).sort({ createdAt: -1 });

        return transactions;
    } catch (error: any) {
        throw error.message;
    }
}
