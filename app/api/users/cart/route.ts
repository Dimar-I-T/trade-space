import { getAuth } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { getCart, updateCart } from '@/services/userService';

export async function GET() {
    try {
        const payload: JwtPayload | null = await getAuth();
        const user_id = payload?._id;

        console.log(user_id)

        const result = await getCart(user_id);

        return NextResponse.json({
            success: true,
            message: 'Successfully retrieved cart',
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}


export async function PUT(req: NextRequest) {
    try {
        const payload: JwtPayload | null = await getAuth();
        const user_id = payload?._id;

        const { item_id, qty, price_snap } = await req.json();
        console.log("item_id: " + item_id);
        console.log("qty: " + qty);
        console.log("price_snap: " + price_snap);
        const result = await updateCart(user_id, item_id, qty, price_snap);


        return NextResponse.json({
            success: true,
            message: 'Cart berhasil diupdate',
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}
