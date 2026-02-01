export type WhatsAppTemplate = {
    id: string;
    name: string;
    language: 'en' | 'ml';
    category: 'AUTHENTICATION' | 'UTILITY' | 'MARKETING';
    status: 'APPROVED' | 'PENDING' | 'REJECTED';
    content: string;
    variables: string[];
};

export const WHATSAPP_TEMPLATES: WhatsAppTemplate[] = [
    {
        id: 'otp_verification',
        name: 'OTP Verification',
        language: 'en',
        category: 'AUTHENTICATION',
        status: 'APPROVED',
        content: "🔒 *Kada Ledger Verification*\n\nYour One-Time Password (OTP) is *{{otp}}*.\n\nDo not share this code with anyone. Valid for 10 minutes.\n\n_Secure your business with Kada Ledger._",
        variables: ['otp']
    },
    {
        id: 'payment_reminder',
        name: 'Payment Reminder',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        content: "👋 Hello *{{customer_name}}*,\n\nThis is a gentle reminder from *{{vendor_name}}* regarding your pending balance of *₹{{amount}}*.\n\nPlease clear the dues at your earliest convenience to avoid interruptions.\n\n_Track your ledger: {{link}}_\n\nThank you,\n*Kada Ledger*",
        variables: ['customer_name', 'vendor_name', 'amount', 'link']
    },
    {
        id: 'payment_reminder_ml',
        name: 'Payment Reminder (Malayalam)',
        language: 'ml',
        category: 'UTILITY',
        status: 'APPROVED',
        content: "👋 നമസ്കാരം *{{customer_name}}*,\n\nതാങ്കളുടെ *{{vendor_name}}* ലേക്കുള്ള ബാക്കി തുകയായ *₹{{amount}}* ഓർമ്മിപ്പിക്കുന്നു.\n\nദയവായി ഈ തുക എത്രയും വേഗം അടയ്ക്കുമെന്ന് കരുതുന്നു.\n\n_വിശദാംശങ്ങൾക്ക്: {{link}}_\n\nനന്ദി,\n*കട ലെഡ്ജർ*",
        variables: ['customer_name', 'vendor_name', 'amount', 'link']
    },
    {
        id: 'transaction_alert_credit',
        name: 'Credit Alert',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        content: "📝 *New Credit Entry*\n\nA credit of *₹{{amount}}* has been added to your account at *{{vendor_name}}*.\n\nTotal Balance: *₹{{balance}}*\n\n_Check details: {{link}}_",
        variables: ['amount', 'vendor_name', 'balance', 'link']
    },
    {
        id: 'transaction_alert_payment',
        name: 'Payment Received',
        language: 'en',
        category: 'UTILITY',
        status: 'APPROVED',
        content: "✅ *Payment Received*\n\nWe received a payment of *₹{{amount}}* at *{{vendor_name}}*.\n\nRemaining Balance: *₹{{balance}}*\n\n_Thank you for your business!_",
        variables: ['amount', 'vendor_name', 'balance']
    },
    {
        id: 'welcome_message',
        name: 'Welcome to Kada Ledger',
        language: 'en',
        category: 'MARKETING',
        status: 'APPROVED',
        content: "🎉 *Welcome to Kada Ledger!*\n\nHello *{{vendor_name}}*, your digital ledger is ready. Start adding customers and tracking credits effortlessly.\n\n🚀 *Get Started:* {{link}}\n\nNeed help? Reply to this message.",
        variables: ['vendor_name', 'link']
    }
];
