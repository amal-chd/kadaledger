const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './.env' });

function normalizePhone(input) {
  const digits = String(input || '').replace(/\D/g, '');
  if (!digits) return '';
  return digits.length > 10 ? digits.slice(-10) : digits;
}

function parseArgs(argv) {
  const out = {};
  for (let i = 2; i < argv.length; i += 1) {
    const arg = argv[i];
    if (!arg.startsWith('--')) continue;
    const key = arg.replace(/^--/, '');
    const next = argv[i + 1];
    if (!next || next.startsWith('--')) {
      out[key] = true;
    } else {
      out[key] = next;
      i += 1;
    }
  }
  return out;
}

async function ensurePlans(db) {
  const defaults = [
    {
      id: 'monthly',
      name: 'Monthly',
      interval: 'month',
      price: 199,
      isActive: true,
      features: ['Unlimited customers', 'Unlimited transactions', 'WhatsApp reminders', 'Basic support'],
      sortOrder: 1,
    },
    {
      id: 'yearly',
      name: 'Yearly',
      interval: 'year',
      price: 1999,
      isActive: true,
      save: 'Save ~16%',
      features: ['Unlimited customers', 'Unlimited transactions', 'WhatsApp reminders', 'Priority support'],
      sortOrder: 2,
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      interval: 'lifetime',
      price: 6499,
      isActive: true,
      save: 'Best Value',
      features: ['Unlimited customers', 'Unlimited transactions', 'WhatsApp reminders', 'All future updates'],
      sortOrder: 3,
    },
  ];

  let created = 0;
  let updated = 0;

  for (const plan of defaults) {
    const ref = db.collection('plans').doc(plan.id);
    const snap = await ref.get();
    const now = new Date();
    if (!snap.exists) {
      await ref.set({ ...plan, createdAt: now, updatedAt: now });
      created += 1;
    } else {
      await ref.set({ ...plan, updatedAt: now }, { merge: true });
      updated += 1;
    }
  }

  return { created, updated };
}

async function ensureVendors(db) {
  const vendors = await db.collection('vendors').get();
  let updated = 0;

  for (const doc of vendors.docs) {
    const data = doc.data() || {};
    const update = {};

    if (!data.id) update.id = doc.id;

    const basePhone = data.phoneNumber || data.phone || data.mobile || '';
    const phoneSearchKey = normalizePhone(basePhone);
    if (phoneSearchKey && data.phoneSearchKey !== phoneSearchKey) {
      update.phoneSearchKey = phoneSearchKey;
    }

    if (!data.language) update.language = 'English';

    if (!data.preferences || typeof data.preferences !== 'object') {
      update.preferences = {
        quietMode: false,
        quietStart: null,
        quietEnd: null,
        enabledCategories: [],
      };
    }

    const hasSubscription = data.subscription && typeof data.subscription === 'object';
    if (!hasSubscription) {
      update.subscription = {
        planType: data.plan || 'TRIAL',
        status: data.planStatus || 'ACTIVE',
        startDate: data.trialStartDate || data.createdAt || new Date(),
        endDate: data.subscriptionEndDate || null,
      };
    }

    if (typeof data.totalCustomers !== 'number') update.totalCustomers = Number(data.totalCustomers || 0);
    if (typeof data.totalPending !== 'number') update.totalPending = Number(data.totalPending || 0);

    if (Object.keys(update).length) {
      update.updatedAt = new Date();
      await doc.ref.set(update, { merge: true });
      updated += 1;
    }
  }

  return { total: vendors.size, updated };
}

async function createVendorIfMissing(db, args) {
  const phone = args.phone ? String(args.phone).trim() : '';
  const password = args.password ? String(args.password) : '';
  const businessName = args['business-name'] ? String(args['business-name']) : '';

  if (!phone) return { created: false, skipped: true, reason: 'no phone provided' };

  const normalized = normalizePhone(phone);
  const byPhone = await db.collection('vendors').where('phoneNumber', '==', phone).limit(1).get();
  const bySearchKey = normalized
    ? await db.collection('vendors').where('phoneSearchKey', '==', normalized).limit(1).get()
    : { empty: true };

  if (!byPhone.empty || !bySearchKey.empty) {
    return { created: false, skipped: true, reason: 'vendor already exists' };
  }

  if (!password || !businessName) {
    return {
      created: false,
      skipped: true,
      reason: 'missing --password or --business-name for create',
    };
  }

  const now = new Date();
  const trialEnd = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const id = db.collection('vendors').doc().id;

  await db.collection('vendors').doc(id).set({
    id,
    businessName,
    phoneNumber: phone,
    phoneSearchKey: normalized,
    password: await bcrypt.hash(password, 10),
    language: 'English',
    createdAt: now,
    updatedAt: now,
    plan: 'TRIAL',
    planStatus: 'ACTIVE',
    trialStartDate: now,
    subscriptionEndDate: trialEnd,
    subscription: {
      planType: 'TRIAL',
      status: 'ACTIVE',
      startDate: now,
      endDate: trialEnd,
    },
    preferences: {
      quietMode: false,
      quietStart: null,
      quietEnd: null,
      enabledCategories: [],
    },
    totalCustomers: 0,
    totalPending: 0,
  });

  return { created: true, id };
}

async function main() {
  const args = parseArgs(process.argv);

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }

  const db = admin.firestore();
  console.log(`Using Firestore project: ${process.env.FIREBASE_PROJECT_ID}`);

  const planResult = await ensurePlans(db);
  const vendorResult = await ensureVendors(db);
  const createResult = await createVendorIfMissing(db, args);

  console.log('Plans:', planResult);
  console.log('Vendors:', vendorResult);
  console.log('Create Vendor:', createResult);
}

main().catch((err) => {
  console.error('Firestore bootstrap failed:', err);
  process.exit(1);
});
