import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

/**
 * Helper untuk simulasi autentikasi.
 * Mengambil user_id dari header "x-user-id".
 * Pada implementasi nyata, ini akan diganti dengan JWT / session.
 */
export async function getAuthUser(request: NextRequest) {
    const userId = request.headers.get('x-user-id');

    if (!userId) {
        return null;
    }

    await dbConnect();
    const user = await User.findById(userId);
    return user;
}

/**
 * Helper untuk mengembalikan response unauthorized.
 */
export function unauthorizedResponse() {
    return NextResponse.json(
        {
            success: false,
            message: "Anda harus login terlebih dahulu",
            data: null
        },
        { status: 401 }
    );
}
