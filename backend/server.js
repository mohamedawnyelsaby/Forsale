// ========================================
// FORSALE BACKEND - Railway Compatible
// ========================================

const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============ MIDDLEWARE ============
app.use(cors({
  origin: '*', // للتطوير - غيرها للإنتاج
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============ STATIC FILES ============
// تقديم Frontend من مجلد frontend
app.use(express.static(path.join(__dirname, '../frontend')));

// ============ HEALTH CHECK ============
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: '✅ Forsale Backend is running!',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// ============ BASIC ENDPOINTS ============

// Get all products (mock data)
app.get('/api/products', (req, res) => {
  res.json({
    success: true,
    data: [
      {
        id: 1,
        name: 'iPhone 15 Pro',
        price: 0.5,
        image: 'https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?w=400',
        seller: 'Ahmed',
        verified: true
      },
      {
        id: 2,
        name: 'MacBook Pro M3',
        price: 1.2,
        image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400',
        seller: 'Sara',
        verified: true
      }
    ]
  });
});

// Search products
app.get('/api/products/search', (req, res) => {
  const { q } = req.query;
  res.json({
    success: true,
    query: q,
    data: [] // TODO: implement real search
  });
});

// User login (mock)
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email && password) {
    res.json({
      success: true,
      user: {
        id: 1,
        email: email,
        name: 'Test User',
        verified: true
      },
      token: 'mock_jwt_token_12345'
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Invalid credentials'
    });
  }
});

// Upload product (mock)
app.post('/api/products/upload', (req, res) => {
  res.json({
    success: true,
    message: 'Product uploaded successfully',
    productId: Date.now()
  });
});

// Earnings endpoint
app.get('/api/admin/earnings', (req, res) => {
  res.json({
    today: 12.50,
    this_week: 85.75,
    this_month: 340.20,
    total: 1250.00
  });
});

// ============ CATCH ALL (للـ SPA Routing) ============
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
  console.log('🚀 Forsale Backend Started!');
  console.log(`📍 URL: http://localhost:${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
