import { format } from 'date-fns';

/**
 * Safely format a date value that might be null, undefined, or invalid.
 * Returns a fallback string (default '—') if the date can't be parsed.
 */
export function safeFormatDate(
    value: any,
    pattern: string = 'MMM d, yyyy',
    fallback: string = '—'
): string {
    if (!value) return fallback;

    try {
        const date = new Date(value);
        if (isNaN(date.getTime())) return fallback;
        return format(date, pattern);
    } catch {
        return fallback;
    }
}
