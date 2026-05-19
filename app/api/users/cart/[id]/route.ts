import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getAuthUser, unauthorizedResponse } from '@/lib/auth';

// DELETE /api/users/cart/:id
// Untuk menghapus suatu item dari cart
// Params: id (cart item _id)
// Harus login: ya
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const authUser = await getAuthUser(request);
        if (!authUser) return unauthorizedResponse();

        const { id } = await params;

        await dbConnect();

        const user = await User.findById(authUser._id);

        // Filter out the cart item dengan _id yang sesuai
        const originalLength = user.cart.length;
        user.cart = user.cart.filter(
            (cartItem: any) => cartItem._id.toString() !== id
        );

        if (user.cart.length === originalLength) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Item tidak ditemukan di cart",
                    data: null
                },
                { status: 404 }
            );
        }

        await user.save();

        return NextResponse.json(
            {
                success: true,
                message: "Berhasil menghapus item dari cart",
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
