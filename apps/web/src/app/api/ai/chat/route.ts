// FORSALE LOGY AI API ROUTE - COMPLETE
// Copy to: apps/web/src/app/api/ai/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

const LOGY_SYSTEM_PROMPT = `You are Logy, the AI assistant for Forsale marketplace.

Your role:
- Help users find products
- Assist with orders and shipping
- Answer questions about Pi Network payments
- Provide personalized recommendations

Be friendly, concise, and helpful. Always prioritize user satisfaction.`;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, history = [] } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Build conversation history
    const messages = [
      ...history.map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'assistant',
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Call Claude API
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: LOGY_SYSTEM_PROMPT,
      messages: messages as any,
    });

    const assistantMessage =
      response.content[0]?.type === 'text'
        ? response.content[0].text
        : 'I apologize, but I had trouble processing your request.';

    return NextResponse.json({
      success: true,
      response: assistantMessage,
    });
  } catch (error) {
    console.error('[Logy AI] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}

export const runtime = 'edge';
