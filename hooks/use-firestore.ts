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
                if (data.stats) {
                    setStats(data.stats);
                }
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
