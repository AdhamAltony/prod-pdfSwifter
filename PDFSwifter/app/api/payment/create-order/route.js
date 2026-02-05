// app/api/payment/create-order/route.js
// API endpoint to create payment order and get payment token

export const runtime = 'nodejs';

import { generatePaymentToken, generateTrackId } from '@/lib/payment/arb-gateway';
import { getClientInfo } from '@/shared/utils/getClientInfo';
import { promises as fs } from 'fs';
import path from 'path';

// Path to orders database
const ORDERS_DB_PATH = path.join(process.cwd(), 'data', 'orders.json');

// Initialize orders database if it doesn't exist
async function initOrdersDB() {
  try {
    await fs.access(ORDERS_DB_PATH);
  } catch {
    const dir = path.dirname(ORDERS_DB_PATH);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(ORDERS_DB_PATH, JSON.stringify({ orders: [] }, null, 2));
  }
}

// Save order to database
async function saveOrder(order) {
  await initOrdersDB();
  const data = JSON.parse(await fs.readFile(ORDERS_DB_PATH, 'utf-8'));
  data.orders.push(order);
  await fs.writeFile(ORDERS_DB_PATH, JSON.stringify(data, null, 2));
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { planName, amount } = body;

    if (!planName || !amount) {
      return new Response(
        JSON.stringify({ success: false, message: 'Plan name and amount are required' }),
        { status: 400 }
      );
    }

    // Get client info for tracking
    const { ip } = getClientInfo(request, null);
    
    // Generate unique track ID
    const trackId = generateTrackId();

    // Prepare order data
    const orderData = {
      amount: parseFloat(amount),
      trackId,
      currencyCode: '682', // SAR
      responseURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/response`,
      errorURL: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/payment/error`,
      udf1: planName, // Store plan name in user-defined field
    };

    // Call ARB Payment Gateway to get payment token
    const paymentResult = await generatePaymentToken(orderData);

    if (paymentResult.success) {
      // Save order to database
      const order = {
        trackId,
        paymentId: paymentResult.paymentId,
        planName,
        amount: parseFloat(amount),
        ip,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };
      await saveOrder(order);
      
      return new Response(
        JSON.stringify({
          success: true,
          paymentId: paymentResult.paymentId,
          paymentUrl: paymentResult.paymentUrl,
          trackId,
        }),
        { status: 200 }
      );
    } else {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Payment token generation failed',
          errorCode: paymentResult.errorCode,
          errorDescription: paymentResult.errorDescription,
        }),
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Create order error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Internal server error' }),
      { status: 500 }
    );
  }
}
