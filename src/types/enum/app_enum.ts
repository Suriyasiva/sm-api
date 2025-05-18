export enum EnumSubscriptionPlan {
  FREEMIUM = 'FREEMIUM',
  MONTHLY = 'MONTHLY',
  ANNUALLY = 'ANNUALLY',
}

export enum EnumSubscriptionStatus {
  TRIAL = 'TRIAL',
  ACTIVE = 'ACTIVE',
  GRACE = 'GRACE',
  SUSPENDED = 'SUSPENDED',
  RENEWED = 'RENEWED',
  EXPIRED = 'EXPIRED',
  UPGRADED = 'UPGRADED',
  DOWNGRADED = 'DOWNGRADED',
  CANCELLED = 'CANCELLED',
}

export enum EnumPaymentStatus {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PENDING = 'PENDING',
}

export enum EnumInvoiceStatus {
  ISSUED = 'ISSUED',
  PAID = 'PAID',
  VOID = 'VOID',
}

export enum EnumSubscriptionPlanStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EnumCustomerSubscriptionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EnumSubscriptionHistoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum EnumPaymentPaymentProvider {
  STRIP = 'STRIP',
  RAZORPAY = 'RAZORPAY',
  BILL_DESK = 'BILL_DESK',
}
