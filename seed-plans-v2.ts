import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('Start restructuring plans...')

    // 1. Delete Business plan
    try {
        const deleted = await prisma.pricingPlan.delete({
            where: { name: 'business' },
        })
        console.log('Deleted business plan:', deleted.name)
    } catch (e) {
        console.log('Business plan not found or already deleted')
    }

    // 2. Ensure Professional (Monthly) exists
    const monthly = await prisma.pricingPlan.upsert({
        where: { name: 'professional' },
        update: {
            name: 'professional',
            price: 199,
            interval: 'month',
            description: 'Monthly subscription for growing businesses.',
            isActive: true,
        },
        create: {
            name: 'professional',
            price: 199,
            interval: 'month',
            description: 'Monthly subscription for growing businesses.',
            features: JSON.stringify([
                "Unlimited Customers",
                "Advanced Analytics",
                "WhatsApp Reminders",
                "Multi-User Access",
                "GST Invoicing",
                "Priority Support"
            ]),
            isActive: true,
        },
    })
    console.log('Upserted Monthly plan:', monthly.name, monthly.price)

    // 3. Ensure Professional (Yearly) exists
    const yearly = await prisma.pricingPlan.upsert({
        where: { name: 'professional_yearly' },
        update: {
            price: 1999,
            interval: 'year',
            description: 'Yearly subscription (Save ~16%).',
            isActive: true,
        },
        create: {
            name: 'professional_yearly',
            price: 1999, // ~2 months free
            interval: 'year',
            description: 'Yearly subscription (Save ~16%).',
            features: JSON.stringify([
                "All Monthly Features",
                "2 Months Free",
                "Priority Support",
                "Early Access to New Features"
            ]),
            isActive: true,
        },
    })
    console.log('Upserted Yearly plan:', yearly.name, yearly.price)

    console.log('Restructuring finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
