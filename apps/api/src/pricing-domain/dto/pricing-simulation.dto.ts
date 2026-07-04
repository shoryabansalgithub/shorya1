export interface CartLineItem {
  id: string; // Transient ID for calculation
  productId: string;
  variantId?: string;
  categoryId?: string;
  brandId?: string;
  quantity: number;
  basePrice: number;
}

export interface PricingSimulationContext {
  shopId: string;
  customerId?: string;
  customerGroupId?: string;
  warehouseId?: string;
  cartLines: CartLineItem[];
  coupons: string[]; // Active coupon codes
}

export interface PricingSimulationResult {
  lines: Array<CartLineItem & {
    finalUnitPrice: number;
    lineTotal: number;
    appliedDiscounts: Array<{ ruleId: string; amount: number; description: string }>;
  }>;
  subTotal: number;
  discountTotal: number;
  grandTotal: number;
}
