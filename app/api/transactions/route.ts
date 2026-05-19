import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Item from '@/models/Item';
import Transaction from '@/models/Transaction';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

// POST /api/transactions
// Untuk melakukan proses transaksi setelah checkout.
// Cek dulu kondisi: balance cukup, stok masih ada.
// Kemudian: potong balance pembeli, tambah balance penjual,
// kurangi stock, tambahkan data snapshotting, hapus item dari cart.
// Body: { item_id: string }
// Harus login: ya
export async function POST(request: NextRequest) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) return unauthorizedResponse();

        const { item_id } = await request.json();

        if (!item_id) {
            return NextResponse.json(
                {
                    success: false,
                    message: "item_id wajib diisi",
                    data: null
                },
                { status: 400 }
            );
        }

        await dbConnect();

        // Ambil data buyer
        const buyer = await User.findById(authUser._id);

        // Cari item di cart buyer
        const cartItem = buyer.cart.find(
            (ci: any) => ci.item_id.toString() === item_id
        );

        if (!cartItem) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Item tidak ditemukan di cart",
                    data: null
                },
                { status: 404 }
            );
        }

        // Ambil data item dari database
        const item = await Item.findById(item_id);

        if (!item) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Item tidak ditemukan",
                    data: null
                },
                { status: 404 }
            );
        }

        const totalAmount = cartItem.price_snap * cartItem.qty;

        // Cek balance cukup
        if (buyer.balance < totalAmount) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Balance tidak cukup. Dibutuhkan ${totalAmount}, balance Anda ${buyer.balance}`,
                    data: null
                },
                { status: 400 }
            );
        }

        // Cek stok masih ada
        if (item.stock < cartItem.qty) {
            return NextResponse.json(
                {
                    success: false,
                    message: `Stok tidak cukup. Tersisa ${item.stock}, dibutuhkan ${cartItem.qty}`,
                    data: null
                },
                { status: 400 }
            );
        }

        // --- Proses transaksi ---

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

        return NextResponse.json(
            {
                success: true,
                message: "Transaksi berhasil",
                data: transaction
            },
            { status: 201 }
        );

    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan pada server",
                data: null
            },
            { status: 500 }
        );
    }
}

// GET /api/transactions
// Untuk mengambil riwayat transaksi user
// Harus login: ya
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) return unauthorizedResponse();

        await dbConnect();

        const transactions = await Transaction.find({
            $or: [
                { buyer_id: authUser._id },
                { seller_id: authUser._id }
            ]
        }).sort({ createdAt: -1 });

        return NextResponse.json(
            {
                success: true,
                message: "Berhasil mengambil riwayat transaksi",
                data: transactions
            },
            { status: 200 }
        );

    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: "Terjadi kesalahan pada server",
                data: null
            },
            { status: 500 }
        );
    }
}
