import { getAuth } from '@/lib/auth';
import { JwtPayload } from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';
import { deleteCartItem } from '@/services/userService';


export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const payload: JwtPayload | null = await getAuth();
        const user_id = payload?._id;

        const { id } = await params;
        const result = await deleteCartItem(user_id, id);

        return NextResponse.json({
            success: true,
            message: 'Item berhasil dihapus dari cart',
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}
