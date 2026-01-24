import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export interface UserPayload {
    sub: string;
    phone: string;
}

export async function getJwtPayload(): Promise<UserPayload | null> {
    try {
        const headersList = await headers();
        const authHeader = headersList.get('authorization');

        if (!authHeader?.startsWith('Bearer ')) {
            return null;
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
        return decoded;
    } catch (error) {
        return null;
    }
}
