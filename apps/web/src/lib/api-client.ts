import apiClient from './api';
import type { Product, Customer } from '@/types';

// ---------------------------------------------------------------------------
// Generic helpers
// ---------------------------------------------------------------------------
async function get<T>(url: string): Promise<T> {
  const { data } = await apiClient.get<T>(url);
  return data;
}

async function post<T>(url: string, body: unknown): Promise<T> {
  const { data } = await apiClient.post<T>(url, body);
  return data;
}

async function patch<T>(url: string, body: unknown): Promise<T> {
  const { data } = await apiClient.patch<T>(url, body);
  return data;
}

async function del(url: string): Promise<void> {
  await apiClient.delete(url);
}

// ---------------------------------------------------------------------------
// Field mapping — backend Prisma shapes → frontend types
// ---------------------------------------------------------------------------

function mapProduct(raw: Record<string, unknown>): Product {
  return {
    id: raw.id as string,
    name: raw.name as string,
    sku: (raw.sku as string) ?? '',
    price: (raw.sellingPrice as number) ?? (raw.mrp as number) ?? 0,
    cost: (raw.costPrice as number) ?? 0,
    quantity: (raw.quantity as number) ?? (raw.currentStock as number) ?? 0,
    category: (raw.category as { name?: string } | undefined)?.name ?? (raw.category as string) ?? 'General',
    description: (raw.description as string) ?? undefined,
    image: ((raw.images as Array<{ url: string }>) ?? [])[0]?.url ?? (raw.image as string) ?? undefined,
  };
}

function mapCustomer(raw: Record<string, unknown>): Customer {
  return {
    id: raw.id as string,
    name: raw.name as string,
    phone: (raw.phone as string) ?? '',
    email: (raw.email as string) ?? '',
    address: (raw.address as string) ?? '',
    udharAmount: (raw.udharAmount as number) ?? (raw.outstandingUdhar as number) ?? (raw.creditBalance as number) ?? 0,
    totalSpent: (raw.totalSpent as number) ?? (raw.totalPurchases as number) ?? 0,
  };
}

// ---------------------------------------------------------------------------
// Products
// ---------------------------------------------------------------------------
export const productsApi = {
  list: () =>
    get<unknown[]>('/products').then((arr) => arr.map((item) => mapProduct(item as Record<string, unknown>))),
  get: (id: string) =>
    get<Record<string, unknown>>(`/products/${id}`).then(mapProduct),

  create: (data: {
    name: string;
    sku: string;
    sellingPrice: number;
    costPrice: number;
    mrp: number;
    categoryId?: string;
    unit?: string;
  }) =>
    post<Record<string, unknown>>('/products', {
      ...data,
      unit: data.unit ?? 'PCS',
      mrp: data.mrp ?? data.sellingPrice,
      wholesalePrice: data.sellingPrice,
    }).then(mapProduct),

  update: (id: string, data: Record<string, unknown>) =>
    patch<Record<string, unknown>>(`/products/${id}`, data).then(mapProduct),

  delete: (id: string) => del(`/products/${id}`),
};

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export const customersApi = {
  list: () =>
    get<unknown[]>('/customers').then((arr) => arr.map((item) => mapCustomer(item as Record<string, unknown>))),
  get: (id: string) =>
    get<Record<string, unknown>>(`/customers/${id}`).then(mapCustomer),

  create: (data: { name: string; phone?: string; email?: string; address?: string }) =>
    post<Record<string, unknown>>('/customers', data).then(mapCustomer),
};

// ---------------------------------------------------------------------------
// Inventory
// ---------------------------------------------------------------------------
export interface BatchItem {
  id: string;
  product: string;
  sku: string;
  batchNo: string;
  quantity: number;
  expDate: string | null;
  mfgDate: string | null;
  supplierLotNumber: string | null;
  status: string;
}

export const inventoryApi = {
  listBatches: () => get<BatchItem[]>('/batches'),

  listProducts: () => get<unknown[]>('/inventory/products'),
};

// ---------------------------------------------------------------------------
// Analytics
// ---------------------------------------------------------------------------
export interface DashboardKpi {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
}

export const analyticsApi = {
  dashboardKpis: () => get<DashboardKpi>('/analytics-domain/analytics/dashboard'),

  topProducts: () => get<unknown[]>('/analytics-domain/analytics/top-products'),

  revenueTrend: (period = 'monthly') =>
    get<unknown[]>(`/analytics-domain/analytics/revenue-trend?period=${period}`),
};

// ---------------------------------------------------------------------------
// Employees
// ---------------------------------------------------------------------------
export const employeesApi = {
  list: () => get<unknown[]>('/users/employees'),
};

// ---------------------------------------------------------------------------
// Suppliers
// ---------------------------------------------------------------------------
export const suppliersApi = {
  list: () => get<unknown[]>('/suppliers'),
};

// ---------------------------------------------------------------------------
// Expenses
// ---------------------------------------------------------------------------
export const expensesApi = {
  list: () => get<unknown[]>('/expenses'),
};
