import {
  EnumPaymentPaymentProvider,
  EnumPaymentStatus,
  EnumSubscriptionPlan,
  EnumSubscriptionStatus,
} from '../enum/app_enum';

export interface ICreateTenant {
  name: string;
  email: string;
  password: string;

  domain: string;
  organizationName: string;
}

// TODO: remove domain name add after tenant created get from req.hostname
export interface ICreateUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  organizationName: string;
  domain: string;
}

export interface ICustomer {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface IPlanUpgrade {
  newPlan: EnumSubscriptionPlan;
  newSubscriptionStatus: EnumSubscriptionPlan;
  paymentTransactionId?: string;
}

export interface IPlanDowngrade {
  newPlan: EnumSubscriptionPlan;
  newSubscriptionStatus: EnumSubscriptionPlan;
  paymentTransactionId?: string;
}

export interface ICalculatePaymentAmount {}

export interface IPaymentOptions {
  status: EnumPaymentStatus;
  type: string;
  subscriptionPlanId: string;
  customerSubscriptionId: string;
  paymentProvider: EnumPaymentPaymentProvider;
  externalTransactionId?: string;
  externalOrderId?: string;
  amount: number;
  metaData?: Record<string, any>;
}

export interface ILogin {
  email: string;
  password: string;
}
