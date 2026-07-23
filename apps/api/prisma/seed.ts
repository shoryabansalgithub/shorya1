/* eslint-disable no-console */
/**
 * Idempotent demo-data seed for DukaanAI.
 *
 * Usage (API must be running):
 *   cd apps/api && DATABASE_URL='mysql://root@localhost:3306/dukaanai' npm run seed
 *
 * Strategy: entities with public endpoints are created THROUGH the API so the
 * real write paths get exercised; entities without endpoints (employees,
 * stock levels, invoice back-dating) fall back to Prisma. Re-running is safe -
 * existing records are matched by their natural keys (SKU, phone, email,
 * title, description) and skipped.
 *
 * Auth: the script logs in as (or registers) demo@dukaan.local / Demo@1234 and
 * sends its Bearer token with every request. With AUTH_DISABLED=true the API
 * ignores the token and everything lands in the system bypass shop; with real
 * auth enabled the same run seeds the demo user's shop.
 */
import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

const API_URL = process.env.SEED_API_URL ?? 'http://localhost:3002/api';
const DEMO_EMAIL = 'demo@dukaan.local';
const DEMO_PASSWORD = 'Demo@1234';

const prisma = new PrismaClient();

let token: string | null = null;

async function api<T = any>(
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; data: T }> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  let data: any = null;
  try {
    data = await res.json();
  } catch {
    /* empty body */
  }
  return { status: res.status, data };
}

async function apiOk<T = any>(method: string, path: string, body?: unknown): Promise<T> {
  const { status, data } = await api<T>(method, path, body);
  if (status < 200 || status >= 300) {
    throw new Error(
      `${method} ${path} failed (HTTP ${status}): ${JSON.stringify(data)?.slice(0, 300)}`,
    );
  }
  return data;
}

async function assertApiReachable(): Promise<void> {
  try {
    await fetch(`${API_URL}/products`);
  } catch (error) {
    console.error(`\nThe API at ${API_URL} is unreachable (${(error as Error).message}).`);
    console.error('Start it first (cd apps/api && npm run dev) or set SEED_API_URL.\n');
    process.exit(1);
  }
}

/** Ensure the demo login account exists and return a Bearer token. */
async function ensureDemoAccount(): Promise<void> {
  const login = () =>
    api<{ access_token?: string }>('POST', '/auth/login', {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

  let res = await login();
  if (res.status !== 201 && res.status !== 200) {
    const registered = await api('POST', '/auth/register', {
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
      name: 'Rajesh Sharma',
      shopName: 'Sharma Kirana Store',
    });
    if (registered.status === 409 || registered.status === 400) {
      // Account exists with a different password - reset it directly.
      const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
      await prisma.user.updateMany({
        where: { email: DEMO_EMAIL },
        data: { password: hash, isActive: true, isLocked: false, failedAttempts: 0 },
      });
      console.log(`Reset password for existing ${DEMO_EMAIL}`);
    } else if (registered.status >= 300) {
      throw new Error(`Could not register demo user: HTTP ${registered.status}`);
    }
    res = await login();
  }
  if (!res.data?.access_token) {
    throw new Error(`Demo login failed (HTTP ${res.status}) - cannot continue.`);
  }
  token = res.data.access_token;
  console.log(`Signed in as ${DEMO_EMAIL}`);
}

// ---------------------------------------------------------------------------
// Dataset
// ---------------------------------------------------------------------------
const CATEGORIES = [
  'Groceries',
  'Snacks & Biscuits',
  'Beverages',
  'Personal Care',
  'Household',
  'Dairy & Bakery',
];

interface SeedProduct {
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  mrp: number;
  stock: number;
  unit: 'PCS' | 'KG' | 'LTR' | 'PACK';
}

const PRODUCTS: SeedProduct[] = [
  { name: 'Aashirvaad Atta 5kg', sku: 'GRO-ATTA-5KG', category: 'Groceries', costPrice: 218, sellingPrice: 245, mrp: 260, stock: 42, unit: 'PACK' },
  { name: 'India Gate Basmati Rice 1kg', sku: 'GRO-RICE-1KG', category: 'Groceries', costPrice: 128, sellingPrice: 149, mrp: 160, stock: 65, unit: 'PACK' },
  { name: 'Tata Salt 1kg', sku: 'GRO-SALT-1KG', category: 'Groceries', costPrice: 22, sellingPrice: 27, mrp: 28, stock: 120, unit: 'PACK' },
  { name: 'Fortune Sunflower Oil 1L', sku: 'GRO-OIL-1L', category: 'Groceries', costPrice: 132, sellingPrice: 152, mrp: 165, stock: 38, unit: 'LTR' },
  { name: 'Toor Dal 1kg', sku: 'GRO-DAL-1KG', category: 'Groceries', costPrice: 148, sellingPrice: 172, mrp: 185, stock: 55, unit: 'KG' },
  { name: 'Parle-G Gold 500g', sku: 'SNK-PARLEG-500', category: 'Snacks & Biscuits', costPrice: 42, sellingPrice: 50, mrp: 55, stock: 90, unit: 'PACK' },
  { name: 'Maggi Noodles 12-pack', sku: 'SNK-MAGGI-12', category: 'Snacks & Biscuits', costPrice: 122, sellingPrice: 138, mrp: 144, stock: 48, unit: 'PACK' },
  { name: 'Lays Magic Masala 90g', sku: 'SNK-LAYS-90', category: 'Snacks & Biscuits', costPrice: 25, sellingPrice: 30, mrp: 30, stock: 75, unit: 'PCS' },
  { name: 'Tata Tea Premium 500g', sku: 'BEV-TEA-500', category: 'Beverages', costPrice: 248, sellingPrice: 285, mrp: 300, stock: 26, unit: 'PACK' },
  { name: 'Nescafe Classic 45g', sku: 'BEV-COFFEE-45', category: 'Beverages', costPrice: 158, sellingPrice: 178, mrp: 190, stock: 8, unit: 'PCS' },
  { name: 'Frooti Mango 1.2L', sku: 'BEV-FROOTI-12', category: 'Beverages', costPrice: 68, sellingPrice: 82, mrp: 85, stock: 34, unit: 'PCS' },
  { name: 'Colgate MaxFresh 150g', sku: 'PC-COLGATE-150', category: 'Personal Care', costPrice: 82, sellingPrice: 95, mrp: 99, stock: 44, unit: 'PCS' },
  { name: 'Dove Shampoo 340ml', sku: 'PC-DOVE-340', category: 'Personal Care', costPrice: 246, sellingPrice: 279, mrp: 290, stock: 6, unit: 'PCS' },
  { name: 'Surf Excel Matic 1kg', sku: 'HH-SURF-1KG', category: 'Household', costPrice: 118, sellingPrice: 135, mrp: 140, stock: 52, unit: 'PACK' },
  { name: 'Amul Butter 500g', sku: 'DB-BUTTER-500', category: 'Dairy & Bakery', costPrice: 252, sellingPrice: 272, mrp: 275, stock: 18, unit: 'PACK' },
];

interface SeedCustomer {
  name: string;
  phone: string;
  email?: string;
  address: string;
  hasUdhaar: boolean;
}

const CUSTOMERS: SeedCustomer[] = [
  { name: 'Ramesh Gupta', phone: '9829012456', email: 'ramesh.gupta@gmail.com', address: '12 Bapu Bazar, Udaipur', hasUdhaar: true },
  { name: 'Priya Nair', phone: '9772034581', email: 'priya.nair@gmail.com', address: '4 Shakti Nagar, Udaipur', hasUdhaar: false },
  { name: 'Suresh Yadav', phone: '9414076923', address: '88 Hiran Magri Sector 4, Udaipur', hasUdhaar: true },
  { name: 'Kavita Joshi', phone: '9950128374', email: 'kavita.joshi@yahoo.in', address: '23 Panchwati, Udaipur', hasUdhaar: false },
  { name: 'Mohammed Iqbal', phone: '9887223140', address: '61 Surajpole, Udaipur', hasUdhaar: true },
  { name: 'Anita Sharma', phone: '9660345872', email: 'anita.s@gmail.com', address: '7 Ashok Nagar, Udaipur', hasUdhaar: false },
  { name: 'Vikram Singh Rathore', phone: '9772456018', address: '15 Fatehpura, Udaipur', hasUdhaar: false },
  { name: 'Deepa Menon', phone: '9829567340', email: 'deepa.menon@outlook.com', address: '31 Saheli Marg, Udaipur', hasUdhaar: true },
];

const SUPPLIERS = [
  { name: 'Mewar Distributors', contactPerson: 'Harish Bohra', phone: '9414112233', email: 'orders@mewardist.in', address: 'Madri Industrial Area, Udaipur', openingBalance: 18450 },
  { name: 'Rajasthan FMCG Agencies', contactPerson: 'Sunil Khandelwal', phone: '9829445566', email: 'sales@rajfmcg.com', address: 'Pratap Nagar, Udaipur', openingBalance: 0 },
  { name: 'Shree Balaji Traders', contactPerson: 'Mukesh Agarwal', phone: '9950667788', address: 'Mandi Road, Udaipur', openingBalance: 7620 },
  { name: 'Aravali Beverages Co', contactPerson: 'Farhan Sheikh', phone: '9772889900', email: 'farhan@aravalibev.in', address: 'Sukher Industrial Area, Udaipur', openingBalance: 12300 },
  { name: 'Udaipur Dairy Fresh', contactPerson: 'Lakshmi Patel', phone: '9887001122', address: 'Saveena, Udaipur', openingBalance: 0 },
];

const EMPLOYEES = [
  { name: 'Aryan Sharma', email: 'aryan@sharmakirana.local', phone: '9660123489', role: Role.MANAGER },
  { name: 'Pooja Kumawat', email: 'pooja@sharmakirana.local', phone: '9414890034', role: Role.CASHIER },
  { name: 'Ravi Prajapat', email: 'ravi@sharmakirana.local', phone: '9950342217', role: Role.CASHIER },
];

const EXPENSES = [
  { description: 'Shop rent - monthly', category: 'Rent', amount: 18000, isPaid: true, paymentMode: 'Bank Transfer', daysAgo: 22 },
  { description: 'Electricity bill (AVVNL)', category: 'Utilities', amount: 3240, isPaid: true, paymentMode: 'UPI', daysAgo: 18 },
  { description: 'Water bill', category: 'Utilities', amount: 460, isPaid: true, paymentMode: 'Cash', daysAgo: 18 },
  { description: 'Staff salary - Aryan', category: 'Salary', amount: 14500, isPaid: true, paymentMode: 'Bank Transfer', daysAgo: 15 },
  { description: 'Staff salary - Pooja', category: 'Salary', amount: 11000, isPaid: true, paymentMode: 'Bank Transfer', daysAgo: 15 },
  { description: 'Refrigerator compressor repair', category: 'Maintenance', amount: 2850, isPaid: true, paymentMode: 'Cash', daysAgo: 11 },
  { description: 'Carry bags and packing material', category: 'Supplies', amount: 1370, isPaid: true, paymentMode: 'Cash', daysAgo: 8 },
  { description: 'Billing printer ribbon', category: 'Supplies', amount: 640, isPaid: true, paymentMode: 'UPI', daysAgo: 6 },
  { description: 'Internet - Jio Fiber', category: 'Utilities', amount: 799, isPaid: false, daysAgo: 3 },
  { description: 'Signboard repainting advance', category: 'Maintenance', amount: 2200, isPaid: false, daysAgo: 1 },
];

const NOTIFICATIONS = [
  { type: 'LOW_STOCK', title: 'Low Stock Alert', message: 'Nescafe Classic 45g and Dove Shampoo 340ml are below their reorder point.' },
  { type: 'PAYMENT_RECEIVED', title: 'Payment Received', message: '₹1,500 received from Ramesh Gupta via UPI against pending udhaar.' },
  { type: 'UDHAR_OVERDUE', title: 'Udhaar Overdue', message: 'Suresh Yadav has an outstanding balance pending for more than 15 days.' },
  { type: 'LARGE_DISCOUNT', title: 'Large Discount Applied', message: 'A discount above 10% was applied on invoice by cashier Pooja Kumawat.' },
];

// Invoice plan: [daysAgo, customerIndex|null, paymentMode, lines, udharAmount?]
type InvoicePlan = {
  daysAgo: number;
  customerIndex: number | null;
  paymentMode: 'CASH' | 'UPI' | 'CARD' | 'SPLIT';
  items: Array<{ sku: string; qty: number }>;
  udharAmount?: number;
};

const INVOICES: InvoicePlan[] = [
  { daysAgo: 29, customerIndex: 0, paymentMode: 'CASH', items: [{ sku: 'GRO-ATTA-5KG', qty: 1 }, { sku: 'GRO-SALT-1KG', qty: 2 }] },
  { daysAgo: 26, customerIndex: 1, paymentMode: 'UPI', items: [{ sku: 'SNK-MAGGI-12', qty: 1 }, { sku: 'BEV-FROOTI-12', qty: 2 }] },
  { daysAgo: 23, customerIndex: 2, paymentMode: 'SPLIT', items: [{ sku: 'GRO-RICE-1KG', qty: 3 }, { sku: 'GRO-OIL-1L', qty: 2 }], udharAmount: 400 },
  { daysAgo: 20, customerIndex: null, paymentMode: 'CASH', items: [{ sku: 'SNK-LAYS-90', qty: 4 }, { sku: 'BEV-FROOTI-12', qty: 1 }] },
  { daysAgo: 17, customerIndex: 3, paymentMode: 'CARD', items: [{ sku: 'PC-DOVE-340', qty: 1 }, { sku: 'PC-COLGATE-150', qty: 2 }] },
  { daysAgo: 14, customerIndex: 4, paymentMode: 'SPLIT', items: [{ sku: 'GRO-ATTA-5KG', qty: 2 }, { sku: 'GRO-DAL-1KG', qty: 2 }], udharAmount: 500 },
  { daysAgo: 11, customerIndex: 5, paymentMode: 'UPI', items: [{ sku: 'DB-BUTTER-500', qty: 1 }, { sku: 'SNK-PARLEG-500', qty: 3 }] },
  { daysAgo: 8, customerIndex: 6, paymentMode: 'CASH', items: [{ sku: 'HH-SURF-1KG', qty: 1 }, { sku: 'GRO-SALT-1KG', qty: 1 }] },
  { daysAgo: 6, customerIndex: 7, paymentMode: 'SPLIT', items: [{ sku: 'BEV-TEA-500', qty: 1 }, { sku: 'SNK-MAGGI-12', qty: 1 }], udharAmount: 300 },
  { daysAgo: 4, customerIndex: 0, paymentMode: 'UPI', items: [{ sku: 'GRO-OIL-1L', qty: 1 }, { sku: 'SNK-LAYS-90', qty: 2 }] },
  { daysAgo: 2, customerIndex: 2, paymentMode: 'CASH', items: [{ sku: 'GRO-RICE-1KG', qty: 2 }, { sku: 'DB-BUTTER-500', qty: 1 }] },
  { daysAgo: 1, customerIndex: 1, paymentMode: 'UPI', items: [{ sku: 'SNK-PARLEG-500', qty: 2 }, { sku: 'BEV-FROOTI-12', qty: 3 }] },
  { daysAgo: 0, customerIndex: 5, paymentMode: 'CASH', items: [{ sku: 'GRO-SALT-1KG', qty: 3 }, { sku: 'SNK-MAGGI-12', qty: 1 }] },
];

function daysAgo(n: number, hour = 11): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(hour, 15 + ((n * 7) % 40), 0, 0);
  return d;
}

// ---------------------------------------------------------------------------
// Seeding steps
// ---------------------------------------------------------------------------
async function main() {
  console.log(`Seeding via API ${API_URL}`);
  await assertApiReachable();
  await ensureDemoAccount();

  const profile = await apiOk<{ id: string; shopId: string; name: string }>('GET', '/auth/profile');
  const shopId = profile.shopId;
  console.log(`Target shop: ${shopId} (running as ${profile.name})`);

  // Converge both auth modes on ONE richly-seeded shop. In bypass mode the
  // target is the system shop; give it a real name and attach the demo login
  // account to it, so signing in as demo@dukaan.local under real auth lands in
  // this same shop and sees all the same data. Idempotent.
  await prisma.shop.update({ where: { id: shopId }, data: { name: 'Sharma Kirana Store' } });
  await prisma.user.updateMany({ where: { email: DEMO_EMAIL }, data: { shopId } });
  console.log(`Renamed shop to "Sharma Kirana Store" and attached ${DEMO_EMAIL}`);

  // -- Categories ------------------------------------------------------------
  const existingCategories = await apiOk<Array<{ id: string; name: string }>>('GET', '/categories');
  const categoryIds = new Map(existingCategories.map((c) => [c.name, c.id]));
  for (const name of CATEGORIES) {
    if (!categoryIds.has(name)) {
      const created = await apiOk<{ id: string }>('POST', '/categories', { name });
      categoryIds.set(name, created.id);
      console.log(`  + category ${name}`);
    }
  }

  // -- Products --------------------------------------------------------------
  const existingProducts = await apiOk<Array<{ id: string; sku: string }>>('GET', '/products');
  const productIdBySku = new Map(existingProducts.map((p) => [p.sku, p.id]));
  for (const product of PRODUCTS) {
    if (!productIdBySku.has(product.sku)) {
      const created = await apiOk<{ id: string }>('POST', '/products', {
        name: product.name,
        sku: product.sku,
        costPrice: product.costPrice,
        sellingPrice: product.sellingPrice,
        mrp: product.mrp,
        wholesalePrice: product.sellingPrice,
        unit: product.unit,
        categoryId: categoryIds.get(product.category),
      });
      productIdBySku.set(product.sku, created.id);
      console.log(`  + product ${product.name}`);
    }
    // Stock has no public endpoint that fits seeding - set directly.
    await prisma.product.update({
      where: { id: productIdBySku.get(product.sku)! },
      data: { currentStock: product.stock },
    });
  }

  // -- Suppliers -------------------------------------------------------------
  const existingSuppliers = await apiOk<Array<{ id: string; phone: string }>>('GET', '/suppliers');
  const supplierPhones = new Set(existingSuppliers.map((s) => s.phone));
  const supplierIds: string[] = existingSuppliers.map((s) => s.id);
  for (const supplier of SUPPLIERS) {
    if (!supplierPhones.has(supplier.phone)) {
      const created = await apiOk<{ id: string }>('POST', '/suppliers', supplier);
      supplierIds.push(created.id);
      console.log(`  + supplier ${supplier.name}`);
    }
  }

  // -- Customers -------------------------------------------------------------
  const existingCustomers = await apiOk<Array<{ id: string; phone: string }>>('GET', '/customers');
  const customerIdByPhone = new Map(existingCustomers.map((c) => [c.phone, c.id]));
  for (const customer of CUSTOMERS) {
    if (!customerIdByPhone.has(customer.phone)) {
      const created = await apiOk<{ id: string }>('POST', '/customers', {
        name: customer.name,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
      });
      customerIdByPhone.set(customer.phone, created.id);
      console.log(`  + customer ${customer.name}`);
    }
    if (customer.hasUdhaar) {
      // Headroom for udhaar invoices below.
      await prisma.customer.update({
        where: { id: customerIdByPhone.get(customer.phone)! },
        data: { creditLimit: 20000 },
      });
    }
  }
  const customerIds = CUSTOMERS.map((c) => customerIdByPhone.get(c.phone)!);

  // -- Employees (no create endpoint - Prisma) --------------------------------
  for (const employee of EMPLOYEES) {
    const existing = await prisma.user.findUnique({ where: { email: employee.email } });
    if (!existing) {
      await prisma.user.create({
        data: {
          email: employee.email,
          name: employee.name,
          phone: employee.phone,
          role: employee.role,
          shopId,
          password: await bcrypt.hash('Staff@1234', 10),
        },
      });
      console.log(`  + employee ${employee.name} (${employee.role})`);
    }
  }

  // -- Invoices (through the real billing engine) -----------------------------
  const invoiceCount = await prisma.invoice.count({ where: { shopId, isDeleted: false } });
  if (invoiceCount >= 10) {
    console.log(`  = ${invoiceCount} invoices already present - skipping invoice seeding`);
  } else {
    for (const plan of INVOICES) {
      const payload = {
        idempotencyKey: crypto.randomUUID(),
        paymentMode: plan.paymentMode,
        customerId: plan.customerIndex === null ? undefined : customerIds[plan.customerIndex],
        udharAmount: plan.udharAmount,
        items: plan.items.map((item) => ({
          productId: productIdBySku.get(item.sku)!,
          quantity: item.qty,
        })),
      };
      const { status, data } = await api<any>('POST', '/billing/invoice', payload);
      if (status >= 300) {
        console.warn(`  ! invoice (${plan.daysAgo}d ago) failed: HTTP ${status} ${JSON.stringify(data)?.slice(0, 200)}`);
        continue;
      }
      const invoiceId = data?.id ?? data?.invoice?.id;
      if (invoiceId) {
        // Spread invoices over the last 30 days so charts have real curves.
        await prisma.invoice.update({
          where: { id: invoiceId },
          data: { createdAt: daysAgo(plan.daysAgo) },
        });
      }
      console.log(`  + invoice ${data?.invoiceNumber ?? invoiceId} (${plan.paymentMode}, ${plan.daysAgo}d ago)`);
    }
  }

  // -- Expenses --------------------------------------------------------------
  const existingExpenses = await apiOk<Array<{ description: string }>>('GET', '/expenses');
  const expenseDescriptions = new Set(existingExpenses.map((e) => e.description));
  for (const expense of EXPENSES) {
    if (!expenseDescriptions.has(expense.description)) {
      await apiOk('POST', '/expenses', {
        description: expense.description,
        category: expense.category,
        amount: expense.amount,
        isPaid: expense.isPaid,
        paymentMode: expense.paymentMode,
        expenseDate: daysAgo(expense.daysAgo).toISOString(),
      });
      console.log(`  + expense ${expense.description}`);
    }
  }

  // -- Notifications ---------------------------------------------------------
  const existingNotifications = await apiOk<Array<{ title: string; message: string }>>('GET', '/notifications');
  const notificationKeys = new Set(existingNotifications.map((n) => `${n.title}|${n.message}`));
  for (const notification of NOTIFICATIONS) {
    if (!notificationKeys.has(`${notification.title}|${notification.message}`)) {
      await apiOk('POST', '/notifications', notification);
      console.log(`  + notification ${notification.title}`);
    }
  }

  // -- Purchase orders (best-effort, complex domain) -------------------------
  const poCount = await prisma.purchaseOrder.count({ where: { shopId } });
  if (poCount === 0 && supplierIds.length >= 2) {
    const poPlans = [
      { supplierId: supplierIds[0], sku: 'GRO-ATTA-5KG', qty: 20, unitCost: 215 },
      { supplierId: supplierIds[1], sku: 'SNK-MAGGI-12', qty: 30, unitCost: 120 },
    ];
    for (const po of poPlans) {
      const productId = productIdBySku.get(po.sku)!;
      const { status, data } = await api('POST', '/purchases', {
        supplierId: po.supplierId,
        currency: 'INR',
        totalAmount: po.qty * po.unitCost,
        notes: 'Restock order (seed)',
        items: [
          {
            productId,
            quantity: po.qty,
            unit: 'PACK',
            unitCost: po.unitCost,
            totalCost: po.qty * po.unitCost,
            price: po.unitCost,
          },
        ],
      });
      if (status >= 300) {
        console.warn(`  ! purchase order for ${po.sku} failed: HTTP ${status} ${JSON.stringify(data)?.slice(0, 200)}`);
      } else {
        console.log(`  + purchase order for ${po.sku}`);
      }
    }
  }

  // -- Summary ---------------------------------------------------------------
  const [products, customers, suppliers, invoices, expenses, notifications] = await Promise.all([
    prisma.product.count({ where: { shopId, isDeleted: false } }),
    prisma.customer.count({ where: { shopId, isDeleted: false } }),
    prisma.supplier.count({ where: { shopId, isDeleted: false } }),
    prisma.invoice.count({ where: { shopId, isDeleted: false } }),
    prisma.expense.count({ where: { shopId, isDeleted: false } }),
    prisma.notification.count({ where: { shopId, isDeleted: false } }),
  ]);
  console.log('\nSeed complete for shop', shopId);
  console.table({ products, customers, suppliers, invoices, expenses, notifications });
}

main()
  .catch((error) => {
    console.error('\nSeed failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
