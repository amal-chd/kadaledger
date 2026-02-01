import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Start seeding plans...');

    const plans = [
        {
            name: 'Monthly',
            price: 199,
            interval: 'month',
            description: 'Full access for 1 month',
            features: 'Unlimited Invoices,Unlimited Customers,Cloud Backup',
            isActive: true,
        },
        {
            name: 'Yearly',
            price: 1999,
            interval: 'year',
            description: 'Full access for 1 year (Save ~15%)',
            features: 'Unlimited Invoices,Unlimited Customers,Cloud Backup,Priority Support',
            isActive: true,
        },
        {
            name: 'Lifetime',
            price: 6499,
            interval: 'lifetime',
            description: 'One-time payment for lifetime access',
            features: 'Unlimited Invoices,Unlimited Customers,Cloud Backup,Priority Support,Future Updates',
            isActive: true,
        },
        {
            name: 'Professional', // Keeping legacy name support if needed, or we can migrate
            price: 199,
            interval: 'month',
            description: 'Legacy Professional Plan',
            features: 'Standard Features',
            isActive: false, // Mark inactive to phase out if duplicated
        }
    ];

    for (const plan of plans) {
        const existing = await prisma.pricingPlan.findUnique({
            where: { name: plan.name }
        });

        if (!existing) {
            await prisma.pricingPlan.create({ data: plan });
            console.log(`Created plan: ${plan.name}`);
        } else {
            // Update price/details if needed, but be careful not to overwrite custom changes
            // For now, we only update if price is 0 or it's clearly a dev environment reset
            // Or simply just log it exists
            console.log(`Plan already exists: ${plan.name}`);

            // Force update price for Lifetime if it exists but is wrong (Implementation Plan Requirement 2)
            if (plan.name === 'Lifetime' && existing.price !== 6499) {
                await prisma.pricingPlan.update({
                    where: { name: 'Lifetime' },
                    data: { price: 6499 }
                });
                console.log('Updated Lifetime price to 6499');
            }
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
