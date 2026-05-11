import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { serializeFirestoreData } from '@/lib/firestore-utils';

export const dynamic = 'force-dynamic';

// Public endpoint — no auth required. Returns customer balance + recent transactions
// for the customer share link (/c/[id]).
// id format: "{vendorId}_{customerId}" encoded as base64, or plain customerId with vendorId header.
// For simplicity, id = "{vendorId}--{customerId}" joined with "--".
export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // id is expected to be base64-encoded "vendorId:customerId"
    let vendorId: string;
    let customerId: string;

    try {
      const decoded = Buffer.from(id, 'base64').toString('utf-8');
      const parts = decoded.split(':');
      if (parts.length !== 2) throw new Error('bad format');
      vendorId = parts[0];
      customerId = parts[1];
    } catch {
      return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    }

    if (!vendorId || !customerId) {
      return NextResponse.json({ error: 'Invalid link' }, { status: 400 });
    }

    const db = firebaseAdmin.firestore();

    const [vendorDoc, customerDoc] = await Promise.all([
      db.collection('vendors').doc(vendorId).get(),
      db.collection('vendors').doc(vendorId).collection('customers').doc(customerId).get(),
    ]);

    if (!vendorDoc.exists || !customerDoc.exists) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const vendorData = vendorDoc.data() as Record<string, unknown>;
    const customerData = customerDoc.data() as Record<string, unknown>;

    // Fetch recent 10 transactions (public view)
    const txSnapshot = await db
      .collection('vendors')
      .doc(vendorId)
      .collection('customers')
      .doc(customerId)
      .collection('transactions')
      .orderBy('date', 'desc')
      .limit(10)
      .get();

    const transactions = txSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return NextResponse.json(
      serializeFirestoreData({
        vendor: {
          businessName: vendorData.businessName,
          phoneNumber: vendorData.phoneNumber,
        },
        customer: {
          id: customerId,
          name: customerData.name,
        },
        balance: customerData.balance ?? 0,
        transactions,
      })
    );
  } catch (error) {
    console.error('Public customer fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
