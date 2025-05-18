export const PREFIX = {
  root: '/',
  auth: '/auth',
  users: '/users',
  tenant: '/tenant',
};

const ROUTES = {
  auth: {
    login: `${PREFIX.auth}/login`,
    findOrganization: `${PREFIX.auth}/organization/find`,
    createOrganization: `${PREFIX.auth}/organization`,
  },
  public: {
    createUser: `${PREFIX.users}/create`,
  },
  tenants: {
    auth: {
      login: `${PREFIX.tenant}/auth/login`,
      lookup: `${PREFIX.tenant}/auth/lookup`,
    },
    customers: {
      create: `${PREFIX.tenant}/customers/create`,
      subscriptions: `${PREFIX.tenant}/subscription`,
    },
    subscriptionPlans: {
      plans: `${PREFIX.tenant}/subscription_plans`,
    },
    customerSubscriptions: {
      upgrade: `${PREFIX.tenant}/subscriptions/upgrade`,
      downgrade: `${PREFIX.tenant}/subscriptions/downgrade`,
      toggleAutoRenewal: `${PREFIX.tenant}/subscriptions/auto-renew`,
    },
    subscriptionHistory: {
      history: `${PREFIX.tenant}/subscriptions/history`,
    },
    payments: {
      calculatePaymentAmount: `${PREFIX.tenant}/payments/calculate-amount/:subscriptionId`,
      createPayment: `${PREFIX.tenant}/payments/create`,
      paymentTransactions: `${PREFIX.tenant}/payment/transactions`,
    },
  },
};

export default ROUTES;
