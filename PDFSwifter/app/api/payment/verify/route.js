// app/api/payment/verify/route.js
// API endpoint to verify payment transaction status

import { NextResponse } from 'next/server';
import { verifyTransactionStatus } from '@/lib/payment/arb-gateway';
import { promises as fs } from 'fs';
import path from 'path';

export const runtime = 'nodejs';

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

// Get order by trackId
async function getOrder(trackId) {
  await initOrdersDB();
  const data = JSON.parse(await fs.readFile(ORDERS_DB_PATH, 'utf-8'));
  return data.orders.find((order) => order.trackId === trackId);
}

// Update order status
async function updateOrderStatus(trackId, status, transactionDetails = {}) {
  await initOrdersDB();
  const data = JSON.parse(await fs.readFile(ORDERS_DB_PATH, 'utf-8'));
  
  const orderIndex = data.orders.findIndex((order) => order.trackId === trackId);
  if (orderIndex !== -1) {
    data.orders[orderIndex] = {
      ...data.orders[orderIndex],
      status,
      transactionDetails,
      verifiedAt: new Date().toISOString(),
    };
    await fs.writeFile(ORDERS_DB_PATH, JSON.stringify(data, null, 2));
    return data.orders[orderIndex];
  }
  return null;
}

export async function POST(request) {
  try {
    const { paymentId, trackId } = await request.json();

    if (!paymentId || !trackId) {
      return NextResponse.json(
        { success: false, message: 'Missing paymentId or trackId' },
        { status: 400 }
      );
    }

    // Verify the transaction with ARB gateway
    const verificationResult = await verifyTransactionStatus(paymentId, trackId);

    if (!verificationResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: verificationResult.message || 'Transaction verification failed',
        },
        { status: 400 }
      );
    }

    // Get the order from database
    const order = await getOrder(trackId);
    if (!order) {
      return NextResponse.json(
        { success: false, message: 'Order not found' },
        { status: 404 }
      );
    }

    // Update order status based on transaction result
    const transactionStatus = verificationResult.result?.toUpperCase() || 'UNKNOWN';
    await updateOrderStatus(trackId, transactionStatus, verificationResult);

    // Return appropriate response based on transaction status
    if (transactionStatus === 'APPROVED' || transactionStatus === 'CAPTURED') {
      return NextResponse.json({
        success: true,
        transactionStatus: 'APPROVED',
        message: 'Payment verified successfully',
        order: {
          trackId: order.trackId,
          planName: order.planName,
          amount: order.amount,
        },
      });
    } else {
      return NextResponse.json({
        success: false,
        transactionStatus,
        message: verificationResult.message || 'Payment was not approved',
      });
    }
  } catch (error) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to verify payment',
        error: error.message,
      },
      { status: 500 }
    );
  }
}
