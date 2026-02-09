export const ADMIN_PLAN_TYPES = ['FREE', 'MONTHLY', 'YEARLY', 'LIFETIME'] as const;

export type AdminPlanType = (typeof ADMIN_PLAN_TYPES)[number];

const LEGACY_TO_CANONICAL: Record<string, AdminPlanType> = {
    TRIAL: 'FREE',
    PROFESSIONAL: 'MONTHLY',
    BUSINESS: 'YEARLY',
};

export function normalizePlanType(input: unknown): AdminPlanType {
    const value = String(input || '').toUpperCase();
    if (ADMIN_PLAN_TYPES.includes(value as AdminPlanType)) {
        return value as AdminPlanType;
    }
    if (LEGACY_TO_CANONICAL[value]) {
        return LEGACY_TO_CANONICAL[value];
    }
    return 'FREE';
}

export function isPaidPlan(input: unknown): boolean {
    const plan = normalizePlanType(input);
    return plan !== 'FREE';
}

export function getPlanDurationDays(plan: AdminPlanType): number | null {
    if (plan === 'MONTHLY') return 30;
    if (plan === 'YEARLY') return 365;
    if (plan === 'LIFETIME') return null;
    return 14;
}
