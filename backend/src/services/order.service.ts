// ============================================
// 📄 FILENAME: order.service.ts (FIXED)
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
  }): Promise<any> {
    const product = await prisma.product.findUnique({
      where: { id: data.product_id }
    });
    
    if (!product) {
      throw new AppError('Product not found', 404);
    }
    
    if (product.stock < data.quantity) {
      throw new AppError('Insufficient stock', 400);
    }
    
    const amount_pi = product.price_pi * data.quantity;
    
    const payment = await piService.createPayment({
      amount: amount_pi,
      memo: `Order for ${product.title}`,
      metadata: {
        productId: String(product.id),
        userId: String(data.buyer_id),
        expectedAmount: amount_pi,
        timestamp: Date.now()
      }
    });
    
    const order = await prisma.order.create({
      data: {
        buyer_id: data.buyer_id,
        seller_id: product.seller_id,
        product_id: data.product_id,
        quantity: data.quantity,
        amount_pi,
        total_amount: amount_pi,
        status: 'CREATED',
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
  
  async getUserOrders(userId: number): Promise<any[]> {
    return await prisma.order.findMany({
      where: {
        OR: [
          { buyer_id: userId },
          { seller_id: userId }
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
  
  async getById(id: number, userId: number): Promise<any> {
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
    
    if (order.buyer_id !== userId && order.seller_id !== userId) {
      throw new AppError('Not authorized to view this order', 403);
    }
    
    return order;
  }
  
  async updateStatus(id: number, userId: number, status: string): Promise<any> {
    const order = await this.getById(id, userId);
    
    if (order.seller_id !== userId) {
      throw new AppError('Only seller can update order status', 403);
    }
    
    const updated = await prisma.order.update({
      where: { id },
      data: { status }
    });
    
    return updated;
  }
  
  async confirmDelivery(id: number, userId: number): Promise<any> {
    const order = await this.getById(id, userId);
    
    if (order.buyer_id !== userId) {
      throw new AppError('Only buyer can confirm delivery', 403);
    }
    
    if (order.payment_id && order.txid) {
      await piService.completePayment(order.payment_id, order.txid);
    }
    
    const updated = await prisma.order.update({
      where: { id },
      data: {
        status: 'COMPLETED'
      }
    });
    
    return updated;
  }
  
  async createDispute(id: number, userId: number, data: any): Promise<any> {
    const order = await this.getById(id, userId);
    
    const disputeNumber = `DIS${Date.now()}${Math.floor(Math.random() * 1000)}`;
    
    const dispute = await prisma.dispute.create({
      data: {
        dispute_number: disputeNumber,
        order_id: id,
        reason: data.reason,
        description: data.description,
        evidence: data.evidence || []
      }
    });
    
    await prisma.order.update({
      where: { id },
      data: { status: 'DISPUTED' }
    });
    
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
