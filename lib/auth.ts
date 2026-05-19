import { jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JwtPayload } from "jsonwebtoken";

export async function getAuth(): Promise<JwtPayload | null> {
    const cookie = await cookies();
    const token = cookie.get('token')?.value;
    if (!token) {
        throw Error('Unauthorized! You must login');
    }

    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        return payload as unknown as JwtPayload;
    } catch (error: any) {
        return null;
    }
}
