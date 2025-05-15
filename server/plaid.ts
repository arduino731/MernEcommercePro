import { Configuration, PlaidApi, PlaidEnvironments, CountryCode, Products } from 'plaid';

// Configure Plaid client
const plaidConfig = new Configuration({
  basePath: PlaidEnvironments[process.env.PLAID_ENV as keyof typeof PlaidEnvironments || 'sandbox'],
  baseOptions: {
    headers: {
      'PLAID-CLIENT-ID': process.env.PLAID_CLIENT_ID,
      'PLAID-SECRET': process.env.PLAID_SECRET,
    },
  },
});

export const plaidClient = new PlaidApi(plaidConfig);

// Function to create a link token
export const createLinkToken = async (userId: string) => {
  try {
    const response = await plaidClient.linkTokenCreate({
      user: {
        client_user_id: userId,
      },
      client_name: 'ShopMERN',
      products: [Products.Payment_initiation],
      country_codes: [CountryCode.Us],
      language: 'en',
    });

    return response.data;
  } catch (error) {
    console.error('Error creating link token:', error);
    throw error;
  }
};

// Function to exchange public token for access token
export const exchangePublicToken = async (publicToken: string) => {
  try {
    const response = await plaidClient.itemPublicTokenExchange({
      public_token: publicToken,
    });

    return response.data;
  } catch (error) {
    console.error('Error exchanging public token:', error);
    throw error;
  }
};

// Function to create a payment
export const createPayment = async (accessToken: string, amount: number, accountId: string, name: string, reference: string) => {
  try {
    // Create a payment recipient
    const recipientResponse = await plaidClient.paymentInitiationRecipientCreate({
      name,
      iban: accountId, // In sandbox, this can be any valid IBAN
      address: {
        street: ["123 Main St"],
        city: "New York",
        postal_code: "10001",
        country: "US",
      },
    });
    
    const recipientId = recipientResponse.data.recipient_id;
    
    // Create a payment
    const paymentResponse = await plaidClient.paymentInitiationPaymentCreate({
      recipient_id: recipientId,
      reference,
      amount: {
        currency: "USD",
        value: amount,
      },
    });
    
    return paymentResponse.data;
  } catch (error) {
    console.error('Error creating payment:', error);
    throw error;
  }
};

// Function to get payment status
export const getPaymentStatus = async (paymentId: string) => {
  try {
    const response = await plaidClient.paymentInitiationPaymentGet({
      payment_id: paymentId,
    });
    
    return response.data;
  } catch (error) {
    console.error('Error getting payment status:', error);
    throw error;
  }
};
