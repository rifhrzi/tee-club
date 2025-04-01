declare module 'midtrans-client' {
  interface SnapConfig {
    isProduction: boolean;
    serverKey: string;
    clientKey: string;
  }

  interface TransactionDetails {
    transaction_details: {
      order_id: string;
      gross_amount: number;
    };
    customer_details?: {
      first_name?: string;
      email?: string;
      phone?: string;
    };
    shipping_address?: {
      first_name?: string;
      phone?: string;
      address?: string;
      city?: string;
      postal_code?: string;
    };
    callbacks?: {
      finish?: string;
      error?: string;
      pending?: string;
    };
  }

  interface TransactionResponse {
    token: string;
    redirect_url: string;
  }

  class Snap {
    constructor(config: SnapConfig);
    createTransaction(details: TransactionDetails): Promise<TransactionResponse>;
  }

  export = {
    Snap: Snap
  };
}