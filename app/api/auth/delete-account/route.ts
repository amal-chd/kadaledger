import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import jwt from 'jsonwebtoken';

export const dynamic = 'force-dynamic';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

export async function DELETE(req: Request) {
    try {
        const authHeader = req.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return corsResponse(NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
        }

        const token = authHeader.split(' ')[1];
        let decoded: any;
        try {
            decoded = jwt.verify(token, JWT_SECRET);
        } catch (e) {
            return corsResponse(NextResponse.json({ error: 'Invalid token' }, { status: 401 }));
        }

        const vendorId = decoded.sub;
        if (!vendorId || vendorId === 'admin') {
            return corsResponse(NextResponse.json({ error: 'Invalid vendor context' }, { status: 403 }));
        }

        const db = firebaseAdmin.firestore();

        // 1. Delete vendor document
        await db.collection('vendors').doc(vendorId).delete();

        // Note: In a complete system, we might also want to delete the vendor's associated data 
        // (customers, orders) or trigger a Cloud Function to clean it up. For Apple compliance, 
        // removing the user account doc is the minimum required step to "delete the account".

        return corsResponse(NextResponse.json({ message: 'Account deleted successfully' }));

    } catch (error) {
        console.error('Delete account error:', error);
        return corsResponse(NextResponse.json({ error: 'Internal server error' }, { status: 500 }));
    }
}

export async function OPTIONS() {
    return handleOptions();
}

function corsResponse(res: NextResponse) {
    res.headers.set('Access-Control-Allow-Origin', '*');
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, DELETE, PATCH');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    return res;
}

function handleOptions() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, DELETE, PATCH',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}
