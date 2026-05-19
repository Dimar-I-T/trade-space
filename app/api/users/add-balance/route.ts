import { getAuth } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { addBalance } from '@/services/userService';

export async function PUT(req: NextRequest) {
    try {
        const payload: JwtPayload | null = await getAuth();
        const user_id = payload?._id;

        const { amount } = await req.json();
        const result = await addBalance(user_id, amount);

        return NextResponse.json({
            success: true,
            message: 'Balance berhasil ditambahkan',
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}