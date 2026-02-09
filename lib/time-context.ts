type ClientTimeContext = {
    timeZone?: string;
    offsetMinutes: number; // Minutes ahead of UTC (e.g. IST = 330)
};

const DATE_KEY_FORMATTER_CACHE = new Map<string, Intl.DateTimeFormat>();

function isValidTimeZone(timeZone: string): boolean {
    try {
        Intl.DateTimeFormat('en-US', { timeZone }).format(new Date());
        return true;
    } catch {
        return false;
    }
}

function parseDateKey(dateKey: string): { year: number; month: number; day: number } {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
    if (!match) {
        throw new Error(`Invalid date key format: ${dateKey}`);
    }
    return {
        year: Number(match[1]),
        month: Number(match[2]),
        day: Number(match[3]),
    };
}

function formatDateKeyParts(year: number, month: number, day: number): string {
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function getDateFormatterForTimeZone(timeZone: string): Intl.DateTimeFormat {
    const cacheKey = `en-US:${timeZone}`;
    const cached = DATE_KEY_FORMATTER_CACHE.get(cacheKey);
    if (cached) return cached;
    const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    DATE_KEY_FORMATTER_CACHE.set(cacheKey, formatter);
    return formatter;
}

function getDateKeyInTimeZone(date: Date, timeZone: string): string {
    const parts = getDateFormatterForTimeZone(timeZone).formatToParts(date);
    const year = parts.find((p) => p.type === 'year')?.value;
    const month = parts.find((p) => p.type === 'month')?.value;
    const day = parts.find((p) => p.type === 'day')?.value;
    if (!year || !month || !day) {
        return formatDateKeyParts(date.getUTCFullYear(), date.getUTCMonth() + 1, date.getUTCDate());
    }
    return `${year}-${month}-${day}`;
}

function getDateKeyWithOffset(date: Date, offsetMinutes: number): string {
    const shifted = new Date(date.getTime() + offsetMinutes * 60_000);
    return formatDateKeyParts(
        shifted.getUTCFullYear(),
        shifted.getUTCMonth() + 1,
        shifted.getUTCDate()
    );
}

function getOffsetMinutesForTimeZone(utcDate: Date, timeZone: string): number {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'shortOffset',
    }).formatToParts(utcDate);

    const tzName = parts.find((p) => p.type === 'timeZoneName')?.value || 'GMT';
    if (tzName === 'GMT') return 0;

    const match = /GMT([+-])(\d{1,2})(?::?(\d{2}))?/.exec(tzName);
    if (!match) return 0;

    const sign = match[1] === '-' ? -1 : 1;
    const hours = Number(match[2]);
    const minutes = Number(match[3] || '0');
    return sign * (hours * 60 + minutes);
}

function zonedDateTimeToUtc(
    year: number,
    month: number,
    day: number,
    hour: number,
    minute: number,
    second: number,
    millisecond: number,
    timeZone: string
): Date {
    const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, millisecond);
    const firstOffset = getOffsetMinutesForTimeZone(new Date(utcGuess), timeZone);
    const firstCandidate = new Date(utcGuess - firstOffset * 60_000);
    const secondOffset = getOffsetMinutesForTimeZone(firstCandidate, timeZone);
    if (secondOffset !== firstOffset) {
        return new Date(utcGuess - secondOffset * 60_000);
    }
    return firstCandidate;
}

export function getClientTimeContext(req: Request): ClientTimeContext {
    const timezoneHeader = req.headers.get('x-timezone')?.trim();
    const offsetHeader = req.headers.get('x-timezone-offset')?.trim();

    const offsetMinutes = Number(offsetHeader);
    const safeOffset = Number.isFinite(offsetMinutes) ? offsetMinutes : 0;

    if (timezoneHeader && isValidTimeZone(timezoneHeader)) {
        return { timeZone: timezoneHeader, offsetMinutes: safeOffset };
    }

    return { offsetMinutes: safeOffset };
}

export function getLocalDateKey(date: Date, context: ClientTimeContext): string {
    if (context.timeZone) {
        return getDateKeyInTimeZone(date, context.timeZone);
    }
    return getDateKeyWithOffset(date, context.offsetMinutes);
}

export function getUtcRangeForLocalDates(
    startDate: string,
    endDate: string,
    context: ClientTimeContext
): { start: Date; end: Date } {
    const startParts = parseDateKey(startDate);
    const endParts = parseDateKey(endDate);

    if (context.timeZone) {
        const start = zonedDateTimeToUtc(
            startParts.year,
            startParts.month,
            startParts.day,
            0,
            0,
            0,
            0,
            context.timeZone
        );
        const end = zonedDateTimeToUtc(
            endParts.year,
            endParts.month,
            endParts.day,
            23,
            59,
            59,
            999,
            context.timeZone
        );
        return { start, end };
    }

    const offsetMs = context.offsetMinutes * 60_000;
    const start = new Date(
        Date.UTC(startParts.year, startParts.month - 1, startParts.day, 0, 0, 0, 0) - offsetMs
    );
    const end = new Date(
        Date.UTC(endParts.year, endParts.month - 1, endParts.day, 23, 59, 59, 999) - offsetMs
    );
    return { start, end };
}
