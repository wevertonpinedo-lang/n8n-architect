import { PaymentRequest, PaymentResponse } from '../types';

const BACKEND_URL = 'http://localhost:3001';

/**
 * Create a payment using Mercado Pago via backend server
 * Supports PIX and Credit Card payments
 */
export const createPayment = async (paymentData: PaymentRequest): Promise<PaymentResponse> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/create-payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentMethod: paymentData.payment_method_id,
        amount: paymentData.transaction_amount,
        productName: paymentData.description,
        customerEmail: paymentData.payer.email,
        customerName: `${paymentData.payer.first_name || ''} ${paymentData.payer.last_name || ''}`.trim(),
        token: paymentData.token,
        installments: paymentData.installments,
        docType: paymentData.payer.identification.type,
        docNumber: paymentData.payer.identification.number,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Erro ao processar pagamento');
    }

    const result: PaymentResponse = await response.json();
    return result;

  } catch (error: any) {
    console.error('[Backend Error]', error);

    // Check if backend is running
    if (error.message?.includes('fetch')) {
      throw new Error('Servidor backend não está rodando. Execute: cd server && npm start');
    }

    throw error;
  }
};

/**
 * Test connection with Mercado Pago
 */
export const testMercadoPagoConnection = async (): Promise<{ success: boolean; message: string; environment?: string }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/api/test-connection`);
    const result = await response.json();
    return result;
  } catch (error) {
    return {
      success: false,
      message: 'Não foi possível conectar ao servidor backend. Verifique se está rodando.'
    };
  }
};

/**
 * Get backend health status
 */
export const getBackendHealth = async (): Promise<{ status: string; mercadoPagoReady: boolean }> => {
  try {
    const response = await fetch(`${BACKEND_URL}/health`);
    return await response.json();
  } catch (error) {
    return { status: 'offline', mercadoPagoReady: false };
  }
};
