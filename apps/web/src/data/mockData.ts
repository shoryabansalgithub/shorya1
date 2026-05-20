import {
  Product,
  Customer,
  SalesData,
  ProductSalesData,
  CustomerAnalytics,
  Transaction,
} from '@/types';

// Dashboard Mock Data
export const mockDashboardStats = {
  totalSales: 128450,
  totalProfit: 32780,
  totalUdhar: 54320,
  lowStockItems: 12,
  todayOrders: 86,
  topCustomers: [
    {
      id: '1',
      name: 'Ramesh Kumar',
      phone: '9876543210',
      udharAmount: 12450,
      totalSpent: 156000,
      lastPurchase: '2 hours ago',
    },
    {
      id: '2',
      name: 'Suresh Yadav',
      phone: '9123456780',
      udharAmount: 8760,
      totalSpent: 98500,
      lastPurchase: '1 day ago',
    },
    {
      id: '3',
      name: 'Amit Verma',
      phone: '9988776655',
      udharAmount: 5320,
      totalSpent: 65400,
      lastPurchase: '3 days ago',
    },
  ],
};

// Products Mock Data
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Maggi 2-Minute (70g)',
    sku: 'MGG001',
    price: 14,
    cost: 8,
    quantity: 450,
    category: 'Snacks',
    description: 'Instant noodles - 2 minute cook time',
  },
  {
    id: '2',
    name: 'Maggi Masala Noodles (Pack of 12)',
    sku: 'MGG002',
    price: 168,
    cost: 95,
    quantity: 120,
    category: 'Snacks',
    description: 'Bundle of 12 packs',
  },
  {
    id: '3',
    name: 'Maggi Hot & Sweet',
    sku: 'MGG003',
    price: 16,
    cost: 9,
    quantity: 280,
    category: 'Snacks',
    description: 'Hot & sweet flavored noodles',
  },
  {
    id: '4',
    name: 'Parle-G Biscuit',
    sku: 'PRL001',
    price: 5,
    cost: 2.5,
    quantity: 50,
    category: 'Biscuits',
    description: 'Popular Indian biscuit',
  },
  {
    id: '5',
    name: 'Surf Excel 1kg',
    sku: 'SRF001',
    price: 150,
    cost: 75,
    quantity: 8,
    category: 'Detergents',
    description: 'Washing powder - 1 kg',
  },
  {
    id: '6',
    name: 'Aashirvaad Atta 5kg',
    sku: 'ASH001',
    price: 250,
    cost: 140,
    quantity: 10,
    category: 'Grocery',
    description: 'Wheat flour - 5 kg bag',
  },
  {
    id: '7',
    name: 'Coca Cola 1L',
    sku: 'COK001',
    price: 60,
    cost: 30,
    quantity: 12,
    category: 'Beverages',
    description: 'Soft drink - 1 liter bottle',
  },
];

// Customers Mock Data
export const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Ramesh Kumar',
    phone: '9876543210',
    email: 'ramesh@example.com',
    address: 'Lajpat Nagar, Delhi',
    udharAmount: 12450,
    totalSpent: 156000,
    lastPurchase: '2026-05-19',
  },
  {
    id: '2',
    name: 'Suresh Yadav',
    phone: '9123456780',
    email: 'suresh@example.com',
    address: 'Saket, Delhi',
    udharAmount: 8760,
    totalSpent: 98500,
    lastPurchase: '2026-05-18',
  },
  {
    id: '3',
    name: 'Amit Verma',
    phone: '9988776655',
    email: 'amit@example.com',
    address: 'Dwarka, Delhi',
    udharAmount: 5320,
    totalSpent: 65400,
    lastPurchase: '2026-05-16',
  },
  {
    id: '4',
    name: 'Neha Singh',
    phone: '8877665544',
    email: 'neha@example.com',
    address: 'Rohini, Delhi',
    udharAmount: 2890,
    totalSpent: 45200,
    lastPurchase: '2026-05-19',
  },
  {
    id: '5',
    name: 'Vikram Patel',
    phone: '7766554433',
    email: 'vikram@example.com',
    address: 'Noida, UP',
    udharAmount: 1980,
    totalSpent: 32000,
    lastPurchase: '2026-05-17',
  },
];

// Sales Data Mock
export const mockSalesData: SalesData[] = [
  { date: 'Mon', sales: 10000 },
  { date: 'Tue', sales: 20000 },
  { date: 'Wed', sales: 15000 },
  { date: 'Thu', sales: 25000 },
  { date: 'Fri', sales: 28450 },
  { date: 'Sat', sales: 22000 },
  { date: 'Sun', sales: 8000 },
];

// Product Sales Mock
export const mockProductSales: ProductSalesData[] = [
  { id: '1', name: 'Groceries', sales: 42, revenue: 53890, quantity: 1250 },
  { id: '2', name: 'Beverages', sales: 21, revenue: 26800, quantity: 890 },
  { id: '3', name: 'Snacks', sales: 17, revenue: 21760, quantity: 650 },
  { id: '4', name: 'Personal Care', sales: 12, revenue: 15320, quantity: 480 },
  { id: '5', name: 'Others', sales: 8, revenue: 10600, quantity: 320 },
];

// Customer Analytics Mock
export const mockCustomerAnalytics: CustomerAnalytics[] = [
  { id: '1', name: 'Ramesh Kumar', spent: 156000, frequency: 45 },
  { id: '2', name: 'Suresh Yadav', spent: 98500, frequency: 28 },
  { id: '3', name: 'Amit Verma', spent: 65400, frequency: 18 },
  { id: '4', name: 'Neha Singh', spent: 45200, frequency: 12 },
  { id: '5', name: 'Vikram Patel', spent: 32000, frequency: 9 },
];

// Recent Transactions Mock
export const mockTransactions: Transaction[] = [
  {
    id: '1',
    invoiceNo: '#INV-1025',
    customerName: 'Ramesh Kumar (Udhar)',
    amount: 1250,
    method: 'Credit',
    status: 'Due',
    timestamp: '2026-05-19T14:30:00',
  },
  {
    id: '2',
    invoiceNo: '#INV-1024',
    customerName: 'Walk-in Customer (Cash)',
    amount: 780,
    method: 'Cash',
    status: 'Completed',
    timestamp: '2026-05-19T14:15:00',
  },
  {
    id: '3',
    invoiceNo: '#INV-1023',
    customerName: 'Suresh Yadav (Udhar)',
    amount: 2150,
    method: 'Credit',
    status: 'Pending',
    timestamp: '2026-05-19T13:45:00',
  },
  {
    id: '4',
    invoiceNo: '#INV-1022',
    customerName: 'Neha Singh (UPI)',
    amount: 980,
    method: 'UPI',
    status: 'Completed',
    timestamp: '2026-05-19T13:20:00',
  },
];

// Low Stock Alerts Mock
export const mockLowStockAlerts = [
  { id: '1', name: 'Parle-G Biscuit', quantity: 5, status: 'Critical' },
  { id: '2', name: 'Surf Excel 1kg', quantity: 8, status: 'Critical' },
  { id: '3', name: 'Aashirvaad Atta 5kg', quantity: 10, status: 'Low' },
  { id: '4', name: 'Coca Cola 1L', quantity: 12, status: 'Low' },
];

// AI Business Insights Mock
export const mockAIInsights = [
  {
    id: '1',
    title: 'Sales Growth',
    description: 'Maggi sales increased 32% this week',
    icon: '📈',
    positive: true,
  },
  {
    id: '2',
    title: 'Customer Alert',
    description: "Ramesh Kumar's udhar is ₹12,450 (Overdue 5 days)",
    icon: '⚠️',
    positive: false,
  },
  {
    id: '3',
    title: 'Peak Hours',
    description: 'Peak sales time: 6PM – 9PM daily',
    icon: '⏰',
    positive: true,
  },
  {
    id: '4',
    title: 'Stock Alert',
    description: 'Parle-G & Surf Excel stock low',
    icon: '📦',
    positive: false,
  },
];

// Category Sales Distribution
export const mockCategorySales = [
  { name: 'Groceries', value: 42, color: '#6366f1' },
  { name: 'Beverages', value: 21, color: '#10b981' },
  { name: 'Snacks', value: 17, color: '#f59e0b' },
  { name: 'Personal Care', value: 12, color: '#ef4444' },
  { name: 'Others', value: 8, color: '#8b5cf6' },
];

// Payment Modes Distribution
export const mockPaymentModes = [
  { name: 'UPI', value: 48, color: '#3b82f6' },
  { name: 'Cash', value: 32, color: '#f97316' },
  { name: 'Card', value: 12, color: '#8b5cf6' },
  { name: 'Other', value: 8, color: '#6366f1' },
];

// Udhar Overview
export const mockUdharOverview = {
  totalUdhar: 54320,
  paidThisMonth: 18760,
  overdue: 35560,
};
