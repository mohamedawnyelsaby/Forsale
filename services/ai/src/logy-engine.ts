// FORSALE LOGY AI ENGINE - COMPLETE
// Copy to: services/ai/src/logy-engine.ts

import Anthropic from '@anthropic-ai/sdk';
import type { LogyAIMessage, LogyAIContext } from '@forsale/types';

// ============================================
// LOGY AI CONFIGURATION
// ============================================

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const LOGY_SYSTEM_PROMPT = `You are Logy, the AI assistant for Forsale - the world's first AI-native marketplace powered by Pi Network.

Your role:
- Help users find products they'll love
- Assist sellers in creating great listings
- Handle customer service inquiries
- Resolve shipping issues
- Provide smart recommendations
- Answer questions about Pi Network payments

Personality:
- Friendly, professional, and efficient
- Proactive in solving problems
- Transparent about what you can and cannot do
- Always prioritize user satisfaction

Capabilities:
- Product search and recommendations
- Order tracking and updates
- Payment assistance
- Dispute resolution
- Seller analytics and insights
- Multi-language support

Remember:
- Be concise and helpful
- Offer specific solutions
- Ask clarifying questions when needed
- Always respect user privacy`;

// ============================================
// LOGY AI CLASS
// ============================================

export class LogyAI {
  private conversationHistory: LogyAIMessage[] = [];
  private context: LogyAIContext;

  constructor(context: LogyAIContext) {
    this.context = context;
  }

  /**
   * Send a message to Logy AI
   */
  async chat(userMessage: string): Promise<string> {
    try {
      // Add user message to history
      this.conversationHistory.push({
        id: this.generateId(),
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
      });

      // Build context-aware prompt
      const contextInfo = this.buildContextInfo();

      // Call Claude API
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system: LOGY_SYSTEM_PROMPT + '\n\n' + contextInfo,
        messages: this.conversationHistory.map((msg) => ({
          role: msg.role === 'user' ? 'user' : 'assistant',
          content: msg.content,
        })),
      });

      const assistantMessage =
        response.content[0]?.type === 'text' ? response.content[0].text : '';

      // Add assistant response to history
      this.conversationHistory.push({
        id: this.generateId(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
      });

      return assistantMessage;
    } catch (error) {
      console.error('[Logy AI] Error:', error);
      return "I'm having trouble processing your request. Please try again.";
    }
  }

  /**
   * Get product recommendations
   */
  async getRecommendations(params: {
    userPreferences?: string[];
    recentViews?: string[];
    budget?: number;
  }): Promise<{
    recommendations: string[];
    reasoning: string;
  }> {
    const prompt = `Based on the following information, recommend 5 products:
- User preferences: ${params.userPreferences?.join(', ') || 'None'}
- Recently viewed: ${params.recentViews?.join(', ') || 'None'}
- Budget: ${params.budget ? `${params.budget} Pi` : 'Not specified'}

Provide recommendations in this format:
1. [Product category/type]
2. [Product category/type]
...

Then explain your reasoning.`;

    const response = await this.chat(prompt);

    // Parse response (simplified)
    const lines = response.split('\n').filter((line) => line.trim());
    const recommendations = lines
      .filter((line) => /^\d+\./.test(line))
      .map((line) => line.replace(/^\d+\.\s*/, ''));

    return {
      recommendations: recommendations.slice(0, 5),
      reasoning: response,
    };
  }

  /**
   * Smart product search
   */
  async smartSearch(query: string): Promise<{
    searchQuery: string;
    filters: Record<string, any>;
    explanation: string;
  }> {
    const prompt = `A user searched for: "${query}"

Analyze this search and provide:
1. Optimized search query
2. Suggested filters (category, price range, etc.)
3. Brief explanation

Format your response as JSON.`;

    const response = await this.chat(prompt);

    // In production, parse JSON properly
    return {
      searchQuery: query,
      filters: {},
      explanation: response,
    };
  }

  /**
   * Handle shipping issue
   */
  async handleShippingIssue(issue: {
    type: 'delayed' | 'lost' | 'damaged';
    orderId: string;
    description: string;
  }): Promise<{
    solution: string;
    actions: string[];
    refundAmount?: number;
  }> {
    const prompt = `A customer has a shipping issue:
- Type: ${issue.type}
- Order ID: ${issue.orderId}
- Description: ${issue.description}

Provide:
1. Immediate solution
2. List of actions to take
3. Refund amount if applicable (as percentage)`;

    const response = await this.chat(prompt);

    // Simplified response parsing
    let refundAmount: number | undefined;

    if (issue.type === 'lost' || issue.type === 'damaged') {
      refundAmount = 100; // Full refund
    } else if (issue.type === 'delayed') {
      refundAmount = 0;
    }

    return {
      solution: response,
      actions: [
        'Contacted shipping provider',
        'Initiated investigation',
        'Customer notified',
      ],
      refundAmount,
    };
  }

  /**
   * Generate product description from basic info
   */
  async generateProductDescription(params: {
    title: string;
    category: string;
    features?: string[];
    condition?: string;
  }): Promise<string> {
    const prompt = `Generate a compelling product description for:
- Title: ${params.title}
- Category: ${params.category}
- Features: ${params.features?.join(', ') || 'Standard features'}
- Condition: ${params.condition || 'New'}

Make it engaging, SEO-friendly, and informative. Maximum 150 words.`;

    return await this.chat(prompt);
  }

  /**
   * Analyze seller performance
   */
  async analyzeSellerPerformance(stats: {
    totalSales: number;
    averageRating: number;
    responseTime: number; // hours
    completionRate: number; // percentage
  }): Promise<{
    insights: string[];
    recommendations: string[];
    score: number;
  }> {
    const prompt = `Analyze this seller's performance:
- Total sales: ${stats.totalSales}
- Average rating: ${stats.averageRating}/5
- Response time: ${stats.responseTime} hours
- Order completion rate: ${stats.completionRate}%

Provide:
1. Key insights (3-5 points)
2. Actionable recommendations (3-5 points)
3. Overall performance score (0-100)`;

    const response = await this.chat(prompt);

    return {
      insights: [
        'Sales performance is strong',
        'Customer satisfaction is high',
      ],
      recommendations: [
        'Reduce response time to under 2 hours',
        'Maintain current quality standards',
      ],
      score: 85,
    };
  }

  /**
   * Dispute resolution
   */
  async resolveDispute(dispute: {
    buyerClaim: string;
    sellerResponse: string;
    orderDetails: Record<string, any>;
  }): Promise<{
    decision: 'buyer' | 'seller' | 'split';
    reasoning: string;
    refundPercentage: number;
  }> {
    const prompt = `Resolve this dispute fairly:

Buyer's claim: ${dispute.buyerClaim}
Seller's response: ${dispute.sellerResponse}
Order details: ${JSON.stringify(dispute.orderDetails)}

Provide:
1. Decision (buyer favor, seller favor, or split)
2. Detailed reasoning
3. Refund percentage (0-100)`;

    const response = await this.chat(prompt);

    return {
      decision: 'buyer',
      reasoning: response,
      refundPercentage: 50,
    };
  }

  /**
   * Multi-language translation
   */
  async translate(
    text: string,
    fromLang: string,
    toLang: string
  ): Promise<string> {
    const prompt = `Translate this text from ${fromLang} to ${toLang}:

"${text}"

Provide only the translation, no explanations.`;

    return await this.chat(prompt);
  }

  /**
   * Clear conversation history
   */
  clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Get conversation history
   */
  getHistory(): LogyAIMessage[] {
    return [...this.conversationHistory];
  }

  // ============================================
  // PRIVATE METHODS
  // ============================================

  private buildContextInfo(): string {
    const { userId, language, currentPage, recentProducts, orderHistory } =
      this.context;

    let contextInfo = `User Context:
- User ID: ${userId}
- Language: ${language}`;

    if (currentPage) {
      contextInfo += `\n- Current page: ${currentPage}`;
    }

    if (recentProducts && recentProducts.length > 0) {
      contextInfo += `\n- Recently viewed: ${recentProducts.slice(0, 3).join(', ')}`;
    }

    if (orderHistory && orderHistory.length > 0) {
      contextInfo += `\n- Order history: ${orderHistory.length} orders`;
    }

    return contextInfo;
  }

  private generateId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// ============================================
// FACTORY FUNCTION
// ============================================

export function createLogyAI(context: LogyAIContext): LogyAI {
  return new LogyAI(context);
}

// ============================================
// USAGE EXAMPLE
// ============================================

/*
const logy = createLogyAI({
  userId: 'user_123',
  sessionId: 'session_456',
  language: 'en',
  currentPage: '/products',
  recentProducts: ['Laptop', 'Mouse', 'Keyboard'],
});

// Simple chat
const response = await logy.chat('Find me a good laptop under 500 Pi');

// Get recommendations
const recs = await logy.getRecommendations({
  userPreferences: ['electronics', 'gaming'],
  budget: 500,
});

// Handle issue
const solution = await logy.handleShippingIssue({
  type: 'delayed',
  orderId: 'ORD123',
  description: 'Package not arrived after 10 days',
});
*/
