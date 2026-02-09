import { firebaseAdmin } from './firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';

/**
 * Service to handle Double-Writes to Firestore for Real-Time Sync.
 * Implements the architecture defined in `realtime_system_design.md`.
 */
export class SyncService {

    // Updates Transaction and Recalculates Customer Balance in Firestore
    static async syncTransaction(vendorId: string, customerId: string, transaction: any, newBalance: number) {
        try {
            console.log(`Syncing Transaction: Vendor=${vendorId}, Cust=${customerId}`);

            const adminDb = firebaseAdmin.firestore();
            const batch = adminDb.batch();

            // 1. Transaction Doc Ref
            const txRef = adminDb
                .collection('vendors')
                .doc(vendorId)
                .collection('transactions')
                .doc(transaction.id);

            // 2. Customer Doc Ref
            const custRef = adminDb
                .collection('vendors')
                .doc(vendorId)
                .collection('customers')
                .doc(customerId);

            // 3. Stats Ref
            const vendorRef = adminDb.collection('vendors').doc(vendorId);

            // Add Transaction
            batch.set(txRef, {
                ...transaction,
                date: transaction.date.toISOString(), // Firestore prefers ISO strings or Timestamp objects
                updatedAt: FieldValue.serverTimestamp()
            });

            // Update Customer Balance
            batch.set(custRef, {
                currentBalance: newBalance,
                lastUpdated: FieldValue.serverTimestamp()
            }, { merge: true });

            // Update Vendor Global Stats (Optimistic Aggregation)
            // Note: Ideally we calculate this from SQL aggregates, but for now we increment/decrement
            const amount = Number(transaction.amount);
            if (transaction.type === 'CREDIT') {
                batch.set(vendorRef, {
                    stats: {
                        todayCredit: FieldValue.increment(amount),
                        totalCredit: FieldValue.increment(amount)
                    }
                }, { merge: true });
            } else {
                batch.set(vendorRef, {
                    stats: {
                        todayPayment: FieldValue.increment(amount),
                        totalCollected: FieldValue.increment(amount),
                        totalCredit: FieldValue.increment(-amount)
                    }
                }, { merge: true });
            }

            await batch.commit();
            console.log('Sync Transaction Complete');

        } catch (error) {
            console.error('Firestore Sync Error (Transaction):', error);
            // Non-blocking: We log but don't fail the request (SQL is truth)
        }
    }

    // Syncs Subscription Status (e.g. after Payment)
    static async syncSubscription(vendorId: string, subscription: any) {
        try {
            console.log(`Syncing Subscription: Vendor=${vendorId}`);

            const adminDb = firebaseAdmin.firestore();
            const vendorRef = adminDb.collection('vendors').doc(vendorId);

            await vendorRef.set({
                subscription: {
                    plan: subscription.planType,
                    status: subscription.status,
                    expiresAt: subscription.endDate.toISOString(),
                    updatedAt: FieldValue.serverTimestamp()
                }
            }, { merge: true });

            console.log('Sync Subscription Complete');

        } catch (error) {
            console.error('Firestore Sync Error (Subscription):', error);
        }
    }

    // Syncs Global Pricing Plans (e.g. after Admin Update)
    static async syncPricingPlans(plans: any[]) {
        try {
            console.log('Syncing Pricing Config');

            const adminDb = firebaseAdmin.firestore();
            await adminDb.collection('config').doc('pricing').set({
                active_plans: plans,
                updatedAt: FieldValue.serverTimestamp()
            });

            console.log('Sync Pricing Complete');
        } catch (error) {
            console.error('Firestore Sync Error (Pricing):', error);
        }
    }

    static async syncCustomerCount(vendorId: string, increment: boolean) {
        try {
            console.log(`Syncing Customer Count: Vendor=${vendorId}, Increment=${increment}`);
            const adminDb = firebaseAdmin.firestore();
            const vendorRef = adminDb.collection('vendors').doc(vendorId);

            await vendorRef.set({
                totalCustomers: FieldValue.increment(increment ? 1 : -1)
            }, { merge: true });

            console.log('Sync Customer Count Complete');
        } catch (error) {
            console.error('Firestore Sync Error (Customer Count):', error);
        }
    }

    // Syncs Customer Details (Create/Update)
    static async syncCustomer(vendorId: string, customer: any) {
        try {
            console.log(`Syncing Customer: Vendor=${vendorId}, Cust=${customer.id}`);
            const adminDb = firebaseAdmin.firestore();
            const custRef = adminDb
                .collection('vendors')
                .doc(vendorId)
                .collection('customers')
                .doc(customer.id);

            await custRef.set({
                id: customer.id,
                name: customer.name,
                phoneNumber: customer.phoneNumber,
                creditLimit: customer.creditLimit || 0,
                // If it's a new customer, balance is 0. If update, preserve existing or take from input if provided.
                // For safety, we trust SQL 'balance' if passed, otherwise default to 0 for new.
                // Ideally, SQL should track balance.
                updatedAt: FieldValue.serverTimestamp()
            }, { merge: true });

            console.log('Sync Customer Complete');
        } catch (error) {
            console.error('Firestore Sync Error (Customer):', error);
        }
    }
}

