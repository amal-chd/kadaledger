import { NextResponse } from 'next/server';
import { getJwtPayload } from '@/lib/auth';

export const dynamic = 'force-dynamic';


export async function POST(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // 1. Get Template
        const { WHATSAPP_TEMPLATES } = await import('@/lib/whatsapp-templates');
        const template = WHATSAPP_TEMPLATES.find(t => t.id === 'payment_reminder');

        // 2. Mock Send
        if (template) {
            console.log(`[WhatsApp Mock] Sending Template: ${template.name}`);
            console.log(`[WhatsApp Mock] Content: ${template.content}`);
        }

        return NextResponse.json({
            success: true,
            message: 'Reminder sent (mock)',
            preview: template?.content
        });

    } catch (error) {
        console.error('WhatsApp reminder error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
