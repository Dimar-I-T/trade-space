import { getAuth } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { checkout, getTransactions } from '@/services/transactionService';

export async function POST(req: NextRequest) {
    try {
        const payload: JwtPayload | null = await getAuth();
        const buyer_id = payload?._id;

        const { item_id } = await req.json();
        const result = await checkout(buyer_id, item_id);

        return NextResponse.json({
            success: true,
            message: 'Transaksi berhasil',
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}

export async function GET() {
    try {
        const payload: JwtPayload | null = await getAuth();
        const user_id = payload?._id;

        const result = await getTransactions(user_id);

        return NextResponse.json({
            success: true,
            message: 'Successfully retrieved transactions',
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}
