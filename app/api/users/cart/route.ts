import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Item from '@/models/Item';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

// GET /api/users/cart
// Untuk menampilkan semua item yang ada di cart
// Harus login: ya
export async function GET(request: NextRequest) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) return unauthorizedResponse();

        await dbConnect();

        const user = await User.findById(authUser._id).populate('cart.item_id');

        return NextResponse.json(
            {
                success: true,
                message: "Berhasil mengambil data cart",
                data: user.cart
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

// PUT /api/users/cart
// Untuk mengubah item di cart (menambah / update item)
// Body: { item_id: string, qty: number, price_snap: number }
// Harus login: ya
export async function PUT(request: NextRequest) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) return unauthorizedResponse();

        const { item_id, qty, price_snap } = await request.json();

        if (!item_id || !qty || !price_snap) {
            return NextResponse.json(
                {
                    success: false,
                    message: "item_id, qty, dan price_snap wajib diisi",
                    data: null
                },
                { status: 400 }
            );
        }

        if (qty <= 0) {
            return NextResponse.json(
                {
                    success: false,
                    message: "qty harus lebih dari 0",
                    data: null
                },
                { status: 400 }
            );
        }

        await dbConnect();

        // Cek apakah item ada
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

        // Cek apakah stok cukup
        if (qty > item.stock) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Qty melebihi stok yang tersedia",
                    data: null
                },
                { status: 400 }
            );
        }

        const user = await User.findById(authUser._id);

        // Cek apakah item sudah ada di cart
        const existingCartItem = user.cart.find(
            (cartItem: any) => cartItem.item_id.toString() === item_id
        );

        if (existingCartItem) {
            // Update qty dan price_snap
            existingCartItem.qty = qty;
            existingCartItem.price_snap = price_snap;
        } else {
            // Tambahkan item baru ke cart
            user.cart.push({ item_id, qty, price_snap });
        }

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Berhasil mengubah cart",
                data: user.cart
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
