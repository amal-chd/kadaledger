/**
 * Recursively converts Firestore Timestamp objects to ISO date strings
 * This ensures proper JSON serialization for API responses
 */
export function serializeFirestoreData(data: any): any {
    if (data === null || data === undefined) {
        return data;
    }

    // Handle Firestore Timestamp objects (both SDK Timestamp and plain object format)
    if (data && typeof data === 'object') {
        // Check if it's a Timestamp with toDate method
        if (data.toDate && typeof data.toDate === 'function') {
            return data.toDate().toISOString();
        }

        // Check if it's a plain object with _seconds and _nanoseconds (serialized Timestamp)
        if (data._seconds !== undefined && data._nanoseconds !== undefined) {
            const date = new Date(data._seconds * 1000 + data._nanoseconds / 1000000);
            return date.toISOString();
        }
    }

    // Handle arrays
    if (Array.isArray(data)) {
        return data.map(item => serializeFirestoreData(item));
    }

    // Handle plain objects
    if (typeof data === 'object' && data.constructor === Object) {
        const serialized: any = {};
        for (const key in data) {
            if (data.hasOwnProperty(key)) {
                serialized[key] = serializeFirestoreData(data[key]);
            }
        }
        return serialized;
    }

    // Return primitives as-is
    return data;
}
