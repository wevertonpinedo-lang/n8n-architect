import express from 'express';
import cors from 'cors';
import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';
import dotenv from 'dotenv';

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(__dirname, '../.env.local');
const examplePath = path.resolve(__dirname, '../.env.example');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else if (fs.existsSync(examplePath)) {
  dotenv.config({ path: examplePath });
} else {
  console.warn('⚠️  No .env file found.');
}

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());

// Initialize Mercado Pago
let client = null;
let paymentClient = null;
let preferenceClient = null;

function initializeMercadoPago() {
  const accessToken = process.env.MP_ACCESS_TOKEN;

  if (!accessToken) {
    console.warn('⚠️  MP_ACCESS_TOKEN não encontrado. Configure no .env.local');
    return false;
  }

  try {
    client = new MercadoPagoConfig({
      accessToken: accessToken,
      options: { timeout: 5000 }
    });

    paymentClient = new Payment(client);
    preferenceClient = new Preference(client);

    console.log('✅ Mercado Pago inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('❌ Erro ao inicializar Mercado Pago:', error.message);
    return false;
  }
}

// Root route
app.get('/', (req, res) => {
  res.send(`
    <div style="font-family: sans-serif; text-align: center; padding: 50px;">
      <h1>🚀 N8N Architect Backend</h1>
      <p style="color: green; font-weight: bold;">Status: Online</p>
      <p>Endpoints disponíveis:</p>
      <ul style="list-style: none; padding: 0;">
        <li><a href="/health">/health</a> - Health Check</li>
        <li>/api/products - Produtos</li>
      </ul>
    </div>
  `);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    mercadoPagoReady: client !== null,
    timestamp: new Date().toISOString()
  });
});

// Create Payment (PIX or Credit Card)
app.post('/api/create-payment', async (req, res) => {
  try {
    if (!paymentClient) {
      return res.status(500).json({
        error: 'Mercado Pago não configurado. Verifique MP_ACCESS_TOKEN no .env.local'
      });
    }

    const {
      paymentMethod,
      amount,
      productName,
      customerEmail,
      customerName,
      token, // For credit card
      installments, // For credit card
      docType, // CPF/CNPJ
      docNumber
    } = req.body;

    // Validate required fields
    if (!paymentMethod || !amount || !productName || !customerEmail) {
      return res.status(400).json({
        error: 'Campos obrigatórios faltando: paymentMethod, amount, productName, customerEmail'
      });
    }

    const paymentData = {
      transaction_amount: parseFloat(amount),
      description: productName,
      payment_method_id: paymentMethod,
      payer: {
        email: customerEmail,
        first_name: customerName || 'Cliente',
        identification: {
          type: docType || 'CPF',
          number: docNumber || '00000000000'
        }
      },
      metadata: {
        product: productName
      }
    };

    // Add specific fields based on payment method
    if (paymentMethod === 'pix') {
      // PIX doesn't need token or installments
    } else {
      // Credit Card needs token and installments
      if (!token) {
        return res.status(400).json({
          error: 'Token de cartão obrigatório para pagamentos com cartão'
        });
      }
      paymentData.token = token;
      paymentData.installments = parseInt(installments) || 1;
    }

    console.log('📝 Criando pagamento:', {
      method: paymentMethod,
      amount: amount,
      email: customerEmail
    });

    const payment = await paymentClient.create({ body: paymentData });

    console.log('✅ Pagamento criado:', payment.id, '- Status:', payment.status);

    // Format response
    const response = {
      id: payment.id,
      status: payment.status,
      status_detail: payment.status_detail
    };

    // Add PIX QR Code if applicable
    if (paymentMethod === 'pix' && payment.point_of_interaction?.transaction_data) {
      response.point_of_interaction = {
        transaction_data: {
          qr_code: payment.point_of_interaction.transaction_data.qr_code,
          qr_code_base64: payment.point_of_interaction.transaction_data.qr_code_base64,
          ticket_url: payment.point_of_interaction.transaction_data.ticket_url
        }
      };
    }

    res.json(response);

  } catch (error) {
    console.error('❌ Erro ao criar pagamento:', error);
    res.status(500).json({
      error: error.message || 'Erro ao processar pagamento',
      details: error.cause || null
    });
  }
});

// Webhook endpoint for Mercado Pago notifications
app.post('/api/webhooks/mercadopago', async (req, res) => {
  try {
    const { type, data } = req.body;

    console.log('🔔 Webhook recebido:', type);

    // Acknowledge receipt immediately
    res.sendStatus(200);

    // Process notification
    if (type === 'payment') {
      const paymentId = data.id;

      if (paymentClient) {
        try {
          const payment = await paymentClient.get({ id: paymentId });
          console.log('💰 Atualização de pagamento:', {
            id: payment.id,
            status: payment.status,
            amount: payment.transaction_amount
          });

          // TODO: Update database, send email, etc.
          // You can add your business logic here

        } catch (error) {
          console.error('Erro ao buscar pagamento:', error);
        }
      }
    }

  } catch (error) {
    console.error('Erro no webhook:', error);
    res.sendStatus(500);
  }
});

// Test endpoint to validate Mercado Pago credentials
app.get('/api/test-connection', async (req, res) => {
  if (!client) {
    return res.status(500).json({
      success: false,
      message: 'Credenciais do Mercado Pago não configuradas'
    });
  }

  try {
    // Try to create a test preference to validate credentials
    const testPreference = {
      items: [{
        title: 'Test',
        quantity: 1,
        unit_price: 10
      }],
      back_urls: {
        success: 'http://localhost:3000',
        failure: 'http://localhost:3000',
        pending: 'http://localhost:3000'
      }
    };

    await preferenceClient.create({ body: testPreference });

    res.json({
      success: true,
      message: 'Conexão com Mercado Pago estabelecida com sucesso!',
      environment: process.env.MP_ACCESS_TOKEN?.startsWith('TEST') ? 'TEST' : 'PRODUCTION'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Erro ao validar credenciais: ' + error.message
    });
  }
});

// --- PRODUCT PERSISTENCE (JSON DB) ---
const PRODUCTS_FILE = path.join(__dirname, 'products.json');

// Initialize products file if not exists
if (!fs.existsSync(PRODUCTS_FILE)) {
  const INITIAL_PRODUCTS = [
    {
      id: '1', name: 'Pack Automação WhatsApp', price: 97.00, type: 'one_time',
      sales: 124, revenue: 12028.00, active: true,
      orderBumpActive: true, orderBumpName: 'Acesso Vitalício à Comunidade', orderBumpPrice: 29.90
    },
    {
      id: '2', name: 'Mentoria N8N Pro', price: 997.00, type: 'one_time',
      sales: 12, revenue: 11964.00, active: true, orderBumpActive: false
    },
    {
      id: '3', name: 'Comunidade Nexus (Mensal)', price: 29.90, type: 'subscription',
      sales: 450, revenue: 13455.00, active: true, orderBumpActive: false
    }
  ];
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(INITIAL_PRODUCTS, null, 2));
}

// GET Products
app.get('/api/products', (req, res) => {
  try {
    const data = fs.readFileSync(PRODUCTS_FILE, 'utf8');
    res.json(JSON.parse(data));
  } catch (error) {
    res.status(500).json({ error: 'Erro ao ler produtos' });
  }
});

// SAVE Products (Full Sync)
app.post('/api/products', (req, res) => {
  try {
    const newProducts = req.body;
    if (!Array.isArray(newProducts)) {
      return res.status(400).json({ error: 'Formato inválido. Esperado array.' });
    }
    fs.writeFileSync(PRODUCTS_FILE, JSON.stringify(newProducts, null, 2));
    res.json({ success: true, count: newProducts.length });
  } catch (error) {
    res.status(500).json({ error: 'Erro ao salvar produtos' });
  }
});

// Initialize and start server
initializeMercadoPago();

app.listen(PORT, () => {
  console.log(`\n🚀 Servidor N8N Architect Backend rodando em http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`💳 Mercado Pago: ${client ? '✅ Configurado' : '⚠️  Não configurado'}\n`);
});
