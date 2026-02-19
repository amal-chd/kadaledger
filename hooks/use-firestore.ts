import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestoreVendorStats(vendorId: string | undefined) {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!vendorId) {
            setLoading(false);
            return;
        }

        console.log('Subscribing to Firestore Stats for:', vendorId);
        const unsub = onSnapshot(doc(db, 'vendors', vendorId), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                // Merge root-level stats (totalPending) with nested stats
                const mergedStats = {
                    ...(data.stats || {}),
                    // Map backend 'totalPending' -> frontend 'totalOutstanding'
                    totalOutstanding: data.totalPending ?? data.stats?.totalCredit ?? 0,
                    totalCustomers: data.totalCustomers ?? data.stats?.totalCustomers ?? 0,
                    // Ensure today's activity is reactive if at root (it might not be yet, but good to prep)
                    todaysActivity: data.todaysActivity ?? data.stats?.todaysActivity ?? { credits: 0, payments: 0 }
                };
                setStats(mergedStats);
            } else {
                console.log('No Firestore doc for vendor');
            }
            setLoading(false);
        }, (error) => {
            console.error('Firestore subscription error:', error);
            setLoading(false);
        });

        return () => unsub();
    }, [vendorId]);

    return { stats, loading };
}
