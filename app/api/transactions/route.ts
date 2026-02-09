import { NextResponse } from 'next/server';
import { firebaseAdmin } from '@/lib/firebase-admin';
import { getJwtPayload } from '@/lib/auth';
import { serializeFirestoreData } from '@/lib/firestore-utils';

export const dynamic = 'force-dynamic';

// GET: Fetch recent transactions
export async function GET(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const customerId = searchParams.get('customerId');

        const db = firebaseAdmin.firestore();

        if (customerId) {
            // Fetch transactions for a specific customer
            const transactionsSnapshot = await db
                .collection('vendors')
                .doc(user.sub)
                .collection('customers')
                .doc(customerId)
                .collection('transactions')
                .orderBy('date', 'desc')
                .limit(50)
                .get();

            const transactions = transactionsSnapshot.docs.map(doc => doc.data());
            return NextResponse.json(serializeFirestoreData(transactions));
        } else {
            // Fetch all recent transactions from vendor's transactions collection
            const transactionsSnapshot = await db
                .collection('vendors')
                .doc(user.sub)
                .collection('transactions')
                .orderBy('date', 'desc')
                .limit(100)
                .get();

            const transactions = transactionsSnapshot.docs.map(doc => doc.data());
            return NextResponse.json(serializeFirestoreData(transactions));
        }
    } catch (error) {
        console.error('Fetch transactions error:', error);

        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST: Add a new transaction (Credit or Payment)
export async function POST(req: Request) {
    try {
        const user = await getJwtPayload();
        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { customerId, type, amount, description, date } = body;

        if (!customerId || !type || !amount) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const transactionDate = date ? new Date(date) : new Date();
        if (isNaN(transactionDate.getTime())) {
            return NextResponse.json({ error: 'Invalid date format' }, { status: 400 });
        }

        const transactionAmount = Number(amount);
        if (isNaN(transactionAmount)) {
            return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
        }

        const db = firebaseAdmin.firestore();
        const batch = db.batch();

        // 1. Create transaction in customer's subcollection
        const transactionRef = db
            .collection('vendors')
            .doc(user.sub)
            .collection('customers')
            .doc(customerId)
            .collection('transactions')
            .doc();

        const transaction = {
            id: transactionRef.id,
            vendorId: user.sub,
            customerId,
            type,
            amount: transactionAmount,
            description: description || null,
            date: transactionDate,
            createdAt: transactionDate
        };

        batch.set(transactionRef, transaction);

        // 2. Also store in vendor's main transactions collection for efficient queries
        const vendorTransactionRef = db
            .collection('vendors')
            .doc(user.sub)
            .collection('transactions')
            .doc(transactionRef.id);

        batch.set(vendorTransactionRef, transaction);

        // 3. Update customer balance
        const balanceChange = type === 'CREDIT' ? transactionAmount : -transactionAmount;
        const customerRef = db.collection('vendors').doc(user.sub).collection('customers').doc(customerId);

        batch.update(customerRef, {
            balance: firebaseAdmin.firestore.FieldValue.increment(balanceChange),
            updatedAt: new Date()
        });

        // 4. Update vendor's total pending
        const vendorRef = db.collection('vendors').doc(user.sub);
        batch.update(vendorRef, {
            totalPending: firebaseAdmin.firestore.FieldValue.increment(balanceChange)
        });

        // Commit all operations atomically
        await batch.commit();

        return NextResponse.json(transaction, { status: 201 });
    } catch (error) {
        console.error('Add transaction error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
