import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';

// GET /api/users/:id
// Mendapatkan data user berdasarkan idnya
// Params: id
// Harus login: tidak
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await dbConnect();
        const { id } = await params;

        const user = await User.findById(id);

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Data user tidak ditemukan",
                    data: null
                },
                { status: 404 }
            );
        }

        return NextResponse.json(
            {
                success: true,
                message: "Berhasil mendapatkan data user",
                data: user
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