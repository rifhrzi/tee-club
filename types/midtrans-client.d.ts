declare module "midtrans-client" {
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

  interface NotificationResponse {
    transaction_id: string;
    order_id: string;
    transaction_status: string;
    fraud_status: string;
    payment_type: string;
    [key: string]: any; // Untuk properti tambahan yang mungkin ada
  }

  class Snap {
    constructor(config: SnapConfig);
    createTransaction(details: TransactionDetails): Promise<TransactionResponse>;
  }

  class CoreApi {
    constructor(config: SnapConfig);
    transaction: {
      notification(body: any): Promise<NotificationResponse>;
    };
  }

  export = {
    Snap: Snap,
    CoreApi: CoreApi,
  };
}
