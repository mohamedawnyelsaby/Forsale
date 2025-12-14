// ============================================
// 📄 FILENAME: order.service.ts
// 📍 PATH: backend/src/services/order.service.ts
// ============================================

import { prisma } from '../config/database';
import { AppError } from '../utils/AppError';
import { PiService } from './pi.service';
import { AIService } from './ai.service';

const piService = new PiService();
const aiService = new AIService();

export class OrderService {
  async create(data: {
    buyer_id: number;
    product_id: number;
    quantity: number;
  }) {
    // Get product
    const product = await prisma.product.findUnique({
      where: { id: data.product_id }
    });
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    if (product.stock < data.quantity) {
      throw new AppError('Insufficient stock', 400);
    }
    
    // Calculate total
    const amount_pi = product.price_pi * data.quantity;
    
    // Create payment with Pi Network
    const payment = await piService.createPayment({
      amount: amount_pi,
      memo: `Order for ${product.title}`,
      metadata: {
        product_id: product.id,
        buyer_id: data.buyer_id
      }
    });
    
    // Create order
    const order = await prisma.order.create({
      data: {
        buyer_id: data.buyer_id,
        product_id: data.product_id,
        quantity: data.quantity,
        amount_pi,
        status: 'PENDING_PAYMENT',
        payment_id: payment.identifier
      },
      include: {
        product: true,
        buyer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    });
    
    return {
      order,
      payment
    };
  }
  
  async getUserOrders(userId: number) {
    return await prisma.order.findMany({
      where: {
        OR: [
          { buyer_id: userId },
          { product: { seller_id: userId } }
        ]
      },
      include: {
        product: {
          include: {
            seller: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        buyer: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      }
    });
  }
  
  async getById(id: number, userId: number) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        product: {
          include: {
            seller: true
          }
        },
        buyer: true
      }
    });
    
    if (!order) {
      throw new AppError('Order not found', 404);
    }
    
    // Check access
    if (order.buyer_id !== userId && order.product.seller_id !== userId) {
      throw new AppError('Not authorized to view this order', 403);
    }
    
    return order;
  }
  
  async updateStatus(id: number, userId: number, status: string) {
    const order = await this.getById(id, userId);
    
    // Only seller can update shipping status
    if (order.product.seller_id !== userId) {
      throw new AppError('Only seller can update order status', 403);
    }
    
    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });
    
    return updated;
  }
  
  async confirmDelivery(id: number, userId: number) {
    const order = await this.getById(id, userId);
    
    // Only buyer can confirm delivery
    if (order.buyer_id !== userId) {
      throw new AppError('Only buyer can confirm delivery', 403);
    }
    
    // Complete payment (release escrow)
    await piService.completePayment(order.payment_id!, order.txid!);
    
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED'
      }
    });
    
    return updated;
  }
  
  async createDispute(id: number, userId: number, data: any) {
    const order = await this.getById(id, userId);
    
    // Create dispute
    const dispute = await prisma.dispute.create({
      data: {
        order_id: id,
        buyer_id: order.buyer_id,
        seller_id: order.product.seller_id,
        reason: data.reason,
        description: data.description,
        evidence: data.evidence || {}
      }
    });
    
    // Update order status
    await prisma.order.update({
      where: { id },
      data: { status: 'DISPUTED' }
    });
    
    // AI arbitration
    const aiDecision = await aiService.analyzeDispute({
      order,
      dispute,
      evidence: data.evidence
    });
    
    return {
      dispute,
      aiDecision
    };
  }
}
