import { NextRequest, NextResponse } from 'next/server';
import { getUserById } from '@/services/userService';

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const result = await getUserById(id);

        return NextResponse.json({
            success: true,
            message: 'Successfully retrieved user data',
            data: result
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error
        }, { status: 500 });
    }
}