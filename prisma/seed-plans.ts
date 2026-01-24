import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const plans = [
        {
            name: 'starter',
            price: 0,
            interval: 'month',
            description: 'Perfect for small businesses just starting out.',
            features: JSON.stringify([
                "Unlimited Customers",
                "Full Analytics Dashboard",
                "WhatsApp Reminders",
                "GST Invoicing",
                "Multi-User Access",
                "Priority Support"
            ]),
            isActive: true
        },
        {
            name: 'professional',
            price: 199,
            interval: 'month',
            description: 'Designed for growing retail businesses.',
            features: JSON.stringify([
                "Unlimited Customers",
                "Advanced Analytics",
                "WhatsApp Reminders",
                "Multi-User Access",
                "GST Invoicing",
                "Priority Support"
            ]),
            isActive: true
        },
        {
            name: 'business', // Enterprise
            price: 999, // Placeholder, usually custom
            interval: 'month',
            description: 'Custom solutions for large businesses.',
            features: JSON.stringify([
                "Custom Dashboard",
                "Franchise Management",
                "White Labeling",
                "API Integrations",
                "Dedicated Account Manager",
                "24/7 Phone Support"
            ]),
            isActive: true
        }
    ]

    console.log('Start seeding plans...')
    for (const plan of plans) {
        const existingPlan = await prisma.pricingPlan.findUnique({
            where: { name: plan.name }
        })

        if (!existingPlan) {
            await prisma.pricingPlan.create({
                data: plan
            })
            console.log(`Created plan: ${plan.name}`)
        } else {
            console.log(`Plan already exists: ${plan.name}`)
        }
    }
    console.log('Seeding finished.')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
