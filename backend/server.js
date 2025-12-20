// ========================================
// FORSALE BACKEND - Pi Network Integration
// ========================================

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ PI NETWORK CONFIG ============
const PI_CONFIG = {
  apiKey: process.env.PI_API_KEY,
  network: process.env.PI_NETWORK || 'testnet', // 'testnet' أو 'mainnet'
  apiUrl: process.env.PI_NETWORK === 'mainnet' 
    ? 'https://api.minepi.com'
    : 'https://api.testnet.minepi.com',
  platformWallet: process.env.PLATFORM_WALLET_ADDRESS,
  commissionRate: parseFloat(process.env.COMMISSION_RATE || '0.03')
};

console.log(`🔷 Pi Network Mode: ${PI_CONFIG.network.toUpperCase()}`);

// ============ MIDDLEWARE ============
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// ============ STATIC FILES ============
app.use(express.static(path.join(__dirname, '../frontend')));

// ============ PI NETWORK HELPER FUNCTIONS ============

/**
 * Verify Pi Network payment
 */
async function verifyPiPayment(paymentId) {
  try {
    const response = await axios.get(
      `${PI_CONFIG.apiUrl}/v2/payments/${paymentId}`,
      {
        headers: {
          'Authorization': `Key ${PI_CONFIG.apiKey}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Pi payment verification failed:', error.message);
    throw new Error('Payment verification failed');
  }
}

/**
 * Complete Pi payment (Server-side approval)
 */
async function completePiPayment(paymentId, txid) {
  try {
    const response = await axios.post(
      `${PI_CONFIG.apiUrl}/v2/payments/${paymentId}/complete`,
      { txid },
      {
        headers: {
          'Authorization': `Key ${PI_CONFIG.apiKey}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Pi payment completion failed:', error.message);
    throw new Error('Payment completion failed');
  }
}

/**
 * Cancel Pi payment
 */
async function cancelPiPayment(paymentId) {
  try {
    const response = await axios.post(
      `${PI_CONFIG.apiUrl}/v2/payments/${paymentId}/cancel`,
      {},
      {
        headers: {
          'Authorization': `Key ${PI_CONFIG.apiKey}`
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('❌ Pi payment cancellation failed:', error.message);
    throw new Error('Payment cancellation failed');
  }
}

// ============ DATABASE MOCK (استبدل بقاعدة بيانات حقيقية) ============
const MOCK_DB = {
  users: [],
  products: [],
  orders: [],
  transactions: [],
  escrows: []
};

// ============ API ENDPOINTS ============

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '✅ Forsale Backend is running!',
    piNetwork: {
      mode: PI_CONFIG.network,
      apiUrl: PI_CONFIG.apiUrl,
      connected: !!PI_CONFIG.apiKey
    },
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============ AUTHENTICATION ============

// Pi Network Authentication
app.post('/api/auth/pi-signin', async (req, res) => {
  try {
    const { accessToken, user } = req.body;
    
    if (!accessToken || !user) {
      return res.status(400).json({
        success: false,
        message: 'Missing authentication data'
      });
    }

    // Verify with Pi Network
    const verification = await axios.get(
      `${PI_CONFIG.apiUrl}/v2/me`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (verification.data.uid !== user.uid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication'
      });
    }

    // Find or create user
    let dbUser = MOCK_DB.users.find(u => u.piUid === user.uid);
    
    if (!dbUser) {
      dbUser = {
        id: Date.now(),
        piUid: user.uid,
        username: user.username,
        verified: false,
        joinedAt: new Date().toISOString(),
        reputation: 5.0,
        totalSales: 0,
        totalPurchases: 0
      };
      MOCK_DB.users.push(dbUser);
    }

    res.json({
      success: true,
      user: dbUser,
      token: `forsale_${Buffer.from(user.uid).toString('base64')}` // استخدم JWT حقيقي في الإنتاج
    });

  } catch (error) {
    console.error('❌ Pi signin error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
});

// ============ PRODUCTS ============

// Get all products
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: MOCK_DB.products.length > 0 ? MOCK_DB.products : [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        price: 0.5,
        image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400',
        seller: { id: 1, name: 'Ahmed', verified: true },
        verified: true,
        hot: true
      },
      {
        id: 2,
        name: 'MacBook Pro M3',
        price: 1.2,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        seller: { id: 2, name: 'Sara', verified: true },
        verified: true,
        hot: false
      }
    ]
  });
});

// Upload product (with AI mock)
app.post('/api/products/upload', (req, res) => {
  const { title, description, price, images, category } = req.body;
  
  const product = {
    id: Date.now(),
    name: title,
    description,
    price: parseFloat(price),
    images,
    category,
    sellerId: 1, // TODO: من الـ authentication
    createdAt: new Date().toISOString(),
    status: 'active',
    aiAnalysis: {
      score: (Math.random() * 2 + 8).toFixed(1), // 8-10
      marketPrice: parseFloat(price) * 1.1,
      summary: 'AI analysis: Good product condition, fair pricing'
    }
  };
  
  MOCK_DB.products.push(product);
  
  res.json({
    success: true,
    message: 'Product uploaded successfully',
    product
  });
});

// ============ PAYMENTS & ESCROW ============

// Create order with escrow
app.post('/api/orders/create', async (req, res) => {
  try {
    const { productId, buyerId, paymentId } = req.body;
    
    // Verify payment with Pi Network
    const payment = await verifyPiPayment(paymentId);
    
    if (payment.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment not completed'
      });
    }
    
    const product = MOCK_DB.products.find(p => p.id === parseInt(productId));
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Calculate commission
    const totalAmount = payment.amount;
    const commission = totalAmount * PI_CONFIG.commissionRate;
    const sellerAmount = totalAmount - commission;
    
    // Create order
    const order = {
      id: `ORD${Date.now()}`,
      productId,
      buyerId,
      sellerId: product.sellerId,
      totalAmount,
      commission,
      sellerAmount,
      paymentId,
      escrowStatus: 'locked',
      status: 'pending_shipment',
      createdAt: new Date().toISOString()
    };
    
    MOCK_DB.orders.push(order);
    
    // Create escrow record
    const escrow = {
      orderId: order.id,
      amount: totalAmount,
      status: 'locked',
      lockedAt: new Date().toISOString()
    };
    
    MOCK_DB.escrows.push(escrow);
    
    res.json({
      success: true,
      message: 'Order created with escrow',
      order,
      escrow: {
        status: 'locked',
        releaseAt: 'On buyer confirmation'
      }
    });
    
  } catch (error) {
    console.error('❌ Order creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Order creation failed',
      error: error.message
    });
  }
});

// Release escrow (buyer confirms receipt)
app.post('/api/escrow/release', async (req, res) => {
  try {
    const { orderId, buyerSignature } = req.body;
    
    const order = MOCK_DB.orders.find(o => o.id === orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    if (order.escrowStatus !== 'locked') {
      return res.status(400).json({
        success: false,
        message: 'Escrow already released'
      });
    }
    
    // TODO: Transfer commission to platform wallet
    const commissionTx = {
      id: `TX${Date.now()}`,
      type: 'commission',
      orderId,
      amount: order.commission,
      from: 'escrow',
      to: PI_CONFIG.platformWallet,
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    
    // TODO: Transfer seller amount to seller
    const sellerTx = {
      id: `TX${Date.now() + 1}`,
      type: 'sale',
      orderId,
      amount: order.sellerAmount,
      from: 'escrow',
      to: 'seller_wallet',
      status: 'completed',
      timestamp: new Date().toISOString()
    };
    
    MOCK_DB.transactions.push(commissionTx, sellerTx);
    
    // Update order and escrow
    order.escrowStatus = 'released';
    order.status = 'completed';
    
    const escrow = MOCK_DB.escrows.find(e => e.orderId === orderId);
    if (escrow) {
      escrow.status = 'released';
      escrow.releasedAt = new Date().toISOString();
    }
    
    console.log(`💰 Commission earned: ${order.commission} Pi from order ${orderId}`);
    
    res.json({
      success: true,
      message: 'Escrow released successfully',
      transactions: {
        commission: commissionTx,
        seller: sellerTx
      }
    });
    
  } catch (error) {
    console.error('❌ Escrow release error:', error);
    res.status(500).json({
      success: false,
      message: 'Escrow release failed',
      error: error.message
    });
  }
});

// ============ ADMIN ENDPOINTS ============

// Get earnings
app.get('/api/admin/earnings', (req, res) => {
  const commissions = MOCK_DB.transactions.filter(t => t.type === 'commission');
  
  const now = new Date();
  const today = commissions
    .filter(t => new Date(t.timestamp).toDateString() === now.toDateString())
    .reduce((sum, t) => sum + t.amount, 0);
  
  const thisWeek = commissions
    .filter(t => {
      const txDate = new Date(t.timestamp);
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= weekAgo;
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  const thisMonth = commissions
    .filter(t => {
      const txDate = new Date(t.timestamp);
      return txDate.getMonth() === now.getMonth() && 
             txDate.getFullYear() === now.getFullYear();
    })
    .reduce((sum, t) => sum + t.amount, 0);
  
  const total = commissions.reduce((sum, t) => sum + t.amount, 0);
  
  res.json({
    today: today.toFixed(2),
    this_week: thisWeek.toFixed(2),
    this_month: thisMonth.toFixed(2),
    total: total.toFixed(2),
    recent_transactions: commissions.slice(-10).reverse()
  });
});

// Switch network (Testnet ↔ Mainnet)
app.post('/api/admin/switch-network', (req, res) => {
  const { network } = req.body;
  
  if (network !== 'testnet' && network !== 'mainnet') {
    return res.status(400).json({
      success: false,
      message: 'Invalid network. Use "testnet" or "mainnet"'
    });
  }
  
  // في الإنتاج، يجب تغيير ENV Variable في Railway
  res.json({
    success: true,
    message: `Network will switch to ${network}`,
    note: 'Restart required. Update PI_NETWORK env variable in Railway.'
  });
});

// ============ PI NETWORK WEBHOOKS ============

// Payment webhook
app.post('/api/webhooks/pi-payment', async (req, res) => {
  try {
    const { paymentId, event } = req.body;
    
    console.log(`🔔 Pi Payment Webhook: ${event} for ${paymentId}`);
    
    switch (event) {
      case 'payment_completed':
        // TODO: Handle payment completion
        break;
      case 'payment_cancelled':
        // TODO: Handle cancellation
        break;
    }
    
    res.json({ success: true });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ success: false });
  }
});

// ============ CATCH ALL ============
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// ============ ERROR HANDLING ============
app.use((err, req, res, next) => {
  console.error('❌ Error:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// ============ START SERVER ============
app.listen(PORT, '0.0.0.0', () => {
  console.log('');
  console.log('🚀 ========================================');
  console.log('   FORSALE AI - Backend Server Started');
  console.log('========================================');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔷 Pi Network: ${PI_CONFIG.network.toUpperCase()}`);
  console.log(`💰 Commission Rate: ${(PI_CONFIG.commissionRate * 100)}%`);
  console.log(`✅ Health: http://localhost:${PORT}/api/health`);
  console.log('========================================');
  console.log('');
});

process.on('SIGTERM', () => {
  console.log('👋 Shutting down gracefully...');
  process.exit(0);
});
