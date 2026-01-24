import { NextResponse } from 'next/server';
import { getJwtPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Placeholder for WhatsApp API integration
        // In a real app, this would call 3rd party WhatsApp API

        return NextResponse.json({ success: true, message: 'Reminder sent (mock)' });

    } catch (error) {
        console.error('WhatsApp reminder error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
