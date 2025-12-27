// ============================================
// FORSALE DATABASE SEED SCRIPT
// Sample data for development and testing
// ============================================
// PATH: packages/database/seed.ts

import { PrismaClient } from './generated/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ============================================
  // 1. Create Sample Users
  // ============================================
  console.log('👤 Creating users...');

  const seller1 = await prisma.user.upsert({
    where: { email: 'seller1@forsale.test' },
    update: {},
    create: {
      email: 'seller1@forsale.test',
      piUserId: 'pi_seller_1',
      piUsername: 'tech_seller_pro',
      firstName: 'Ahmed',
      lastName: 'Mohamed',
      role: 'SELLER',
      verificationLevel: 'PI_KYC_VERIFIED',
      kycVerified: true,
      trustScore: 95,
      averageRating: 4.8,
      totalSales: 150,
      bio: 'Professional electronics seller with 5 years experience',
      country: 'EG',
      city: 'Cairo',
    },
  });

  const seller2 = await prisma.user.upsert({
    where: { email: 'seller2@forsale.test' },
    update: {},
    create: {
      email: 'seller2@forsale.test',
      piUserId: 'pi_seller_2',
      piUsername: 'fashion_boutique',
      firstName: 'Sara',
      lastName: 'Ali',
      role: 'SELLER',
      verificationLevel: 'FORSALE_VERIFIED',
      kycVerified: true,
      trustScore: 98,
      averageRating: 4.9,
      totalSales: 320,
      bio: 'Luxury fashion and accessories',
      country: 'EG',
      city: 'Alexandria',
    },
  });

  const buyer1 = await prisma.user.upsert({
    where: { email: 'buyer1@forsale.test' },
    update: {},
    create: {
      email: 'buyer1@forsale.test',
      piUserId: 'pi_buyer_1',
      piUsername: 'tech_enthusiast',
      firstName: 'Omar',
      lastName: 'Hassan',
      role: 'BUYER',
      verificationLevel: 'PHONE_VERIFIED',
      trustScore: 85,
      totalOrders: 25,
      country: 'EG',
      city: 'Giza',
    },
  });

  console.log(`✅ Created ${3} users\n`);

  // ============================================
  // 2. Create Sample Products
  // ============================================
  console.log('📦 Creating products...');

  const products = [
    // Electronics
    {
      title: 'MacBook Pro 16" M3 Max - Like New',
      description: 'Excellent condition MacBook Pro with M3 Max chip, 32GB RAM, 1TB SSD. Includes original box and charger. Used for only 3 months.',
      category: 'ELECTRONICS',
      price: 2500,
      quantity: 1,
      images: ['https://picsum.photos/seed/macbook/800/600'],
      condition: 'LIKE_NEW',
      brand: 'Apple',
      sellerId: seller1.id,
      status: 'ACTIVE',
      tags: ['laptop', 'apple', 'macbook', 'm3'],
    },
    {
      title: 'Sony WH-1000XM5 Wireless Headphones',
      description: 'Premium noise-cancelling headphones. Perfect for music lovers and frequent travelers. 30-hour battery life.',
      category: 'ELECTRONICS',
      price: 350,
      quantity: 5,
      images: ['https://picsum.photos/seed/sony/800/600'],
      condition: 'NEW',
      brand: 'Sony',
      sellerId: seller1.id,
      status: 'ACTIVE',
      tags: ['headphones', 'wireless', 'noise-cancelling'],
    },
    {
      title: 'iPhone 15 Pro Max 256GB - Natural Titanium',
      description: 'Brand new sealed iPhone 15 Pro Max. Natural Titanium color, 256GB storage. International warranty.',
      category: 'ELECTRONICS',
      price: 1200,
      quantity: 3,
      images: ['https://picsum.photos/seed/iphone/800/600'],
      condition: 'NEW',
      brand: 'Apple',
      sellerId: seller1.id,
      status: 'ACTIVE',
      tags: ['iphone', 'smartphone', 'apple'],
    },
    // Fashion
    {
      title: 'Luxury Leather Handbag - Designer Collection',
      description: 'Genuine leather handbag from our premium collection. Handcrafted with attention to detail. Multiple compartments.',
      category: 'FASHION',
      price: 450,
      quantity: 2,
      images: ['https://picsum.photos/seed/handbag/800/600'],
      condition: 'NEW',
      brand: 'Luxury Brand',
      sellerId: seller2.id,
      status: 'ACTIVE',
      tags: ['handbag', 'leather', 'luxury', 'fashion'],
    },
    {
      title: 'Cashmere Wool Winter Coat - Black',
      description: 'Premium cashmere wool blend coat. Perfect for winter. Tailored fit, dry clean only. Size Medium.',
      category: 'FASHION',
      price: 280,
      quantity: 4,
      images: ['https://picsum.photos/seed/coat/800/600'],
      condition: 'NEW',
      brand: 'Premium Fashion',
      sellerId: seller2.id,
      status: 'ACTIVE',
      tags: ['coat', 'winter', 'cashmere', 'clothing'],
    },
    {
      title: 'Designer Sunglasses - UV Protection',
      description: 'Stylish designer sunglasses with 100% UV protection. Includes case and cleaning cloth.',
      category: 'FASHION',
      price: 150,
      quantity: 10,
      images: ['https://picsum.photos/seed/sunglasses/800/600'],
      condition: 'NEW',
      brand: 'Fashion Brand',
      sellerId: seller2.id,
      status: 'ACTIVE',
      tags: ['sunglasses', 'accessories', 'fashion'],
    },
    // Home & Garden
    {
      title: 'Smart Robot Vacuum Cleaner with Mapping',
      description: 'Intelligent robot vacuum with room mapping, automatic charging, and app control. Perfect for hardwood and carpet.',
      category: 'HOME_GARDEN',
      price: 380,
      quantity: 8,
      images: ['https://picsum.photos/seed/vacuum/800/600'],
      condition: 'NEW',
      brand: 'SmartHome',
      sellerId: seller1.id,
      status: 'ACTIVE',
      tags: ['vacuum', 'robot', 'smart-home', 'cleaning'],
    },
    {
      title: 'Organic Cotton Bed Sheet Set - King Size',
      description: '100% organic cotton bed sheet set. Includes fitted sheet, flat sheet, and 2 pillowcases. Machine washable.',
      category: 'HOME_GARDEN',
      price: 85,
      quantity: 15,
      images: ['https://picsum.photos/seed/bedsheet/800/600'],
      condition: 'NEW',
      sellerId: seller2.id,
      status: 'ACTIVE',
      tags: ['bedding', 'cotton', 'organic', 'sheets'],
    },
    // Books
    {
      title: 'Complete Programming Collection - 10 Books',
      description: 'Bundle of 10 programming books covering Python, JavaScript, React, and more. Like new condition.',
      category: 'BOOKS_MEDIA',
      price: 120,
      quantity: 3,
      images: ['https://picsum.photos/seed/books/800/600'],
      condition: 'LIKE_NEW',
      sellerId: seller1.id,
      status: 'ACTIVE',
      tags: ['books', 'programming', 'education', 'technology'],
    },
    // Toys
    {
      title: 'Educational STEM Building Kit - 500 Pieces',
      description: 'Creative building kit for kids 8+. Encourages problem-solving and creativity. Includes instruction manual.',
      category: 'TOYS_HOBBIES',
      price: 65,
      quantity: 20,
      images: ['https://picsum.photos/seed/toys/800/600'],
      condition: 'NEW',
      sellerId: seller1.id,
      status: 'ACTIVE',
      tags: ['toys', 'educational', 'stem', 'kids'],
    },
  ];

  for (const product of products) {
    const slug = `${product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Date.now().toString(36)}`;
    
    await prisma.product.create({
      data: {
        ...product,
        slug,
      },
    });
  }

  console.log(`✅ Created ${products.length} products\n`);

  // ============================================
  // 3. Create Sample Addresses
  // ============================================
  console.log('📍 Creating addresses...');

  await prisma.address.create({
    data: {
      userId: buyer1.id,
      label: 'Home',
      fullName: 'Omar Hassan',
      phone: '+201234567890',
      addressLine1: '123 Tahrir Street',
      city: 'Giza',
      state: 'Giza',
      postalCode: '12345',
      country: 'Egypt',
      isDefault: true,
      verified: true,
    },
  });

  console.log('✅ Created addresses\n');

  // ============================================
  // 4. Create Sample Reviews
  // ============================================
  console.log('⭐ Creating reviews...');

  const macbook = await prisma.product.findFirst({
    where: { title: { contains: 'MacBook' } },
  });

  if (macbook) {
    await prisma.review.create({
      data: {
        productId: macbook.id,
        userId: buyer1.id,
        rating: 5,
        comment: 'Amazing laptop! Seller was very responsive and shipping was fast. Highly recommended!',
        verifiedPurchase: true,
      },
    });
  }

  console.log('✅ Created reviews\n');

  // ============================================
  // Summary
  // ============================================
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Summary:');
  console.log(`   • Users: 3 (2 sellers, 1 buyer)`);
  console.log(`   • Products: ${products.length}`);
  console.log(`   • Categories: Electronics, Fashion, Home & Garden, Books, Toys`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
