import type { OrderStatus, Role } from './orderRules';
import type { PriceBreakdown, PromoRule } from './pricing';

// Bentuk data yang dikirim server lewat API dan dipakai halaman.
export interface PublicUser {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

export interface Payment {
  method: string;
  senderName: string;
  amount: number;
  paidAt: string;
}

export interface Order {
  id: string;
  userId: number;
  brideName: string;
  groomName: string;
  weddingDate: string;
  location: string;
  templateName: string;
  packageName: string;
  guestCount: number;
  extraPrintQty: number;
  promoCode: string;
  designNotes: string;
  price: Omit<PriceBreakdown, 'promoCode'>;
  status: OrderStatus;
  payment: Payment | null;
  rejectReason: string;
  createdAt: string;
  updatedAt: string;
  customer?: { name: string; email: string; phone: string };
}

export interface Promo extends PromoRule {
  id: number;
  isActive: boolean;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  isActive: boolean;
  createdAt: string;
  orderCount: number;
}

export interface AdminSummary {
  customerCount: number;
  orderCount: number;
  revenue: number;
  byStatus: Record<OrderStatus, number>;
}
