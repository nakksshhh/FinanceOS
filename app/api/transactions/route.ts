// app/api/transactions/route.ts

export const dynamic = 'force-dynamic'; // ✅ required for request.json() + MongoDB

import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { transactionSchema } from '@/lib/validations';

export async function GET() {
  try {
    console.log('Attempting to connect to MongoDB...');
    const client = await clientPromise;
    console.log('MongoDB connection successful');

    const db = client.db('personal-finance');
    const transactions = await db
      .collection('transactions')
      .find({})
      .sort({ date: -1 })
      .toArray();

    console.log(`Found ${transactions.length} transactions`);
    return NextResponse.json(transactions);
  } catch (error) {
    console.error('Error in GET /api/transactions:', error);

    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please check your MongoDB connection string.' },
          { status: 503 }
        );
      }
      if (error.message.includes('Authentication failed')) {
        return NextResponse.json(
          { error: 'Database authentication failed. Please check your MongoDB credentials.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: `Database error: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = transactionSchema.parse(body);

    console.log('Attempting to connect to MongoDB for POST...');
    const client = await clientPromise;
    console.log('MongoDB connection successful for POST');

    const db = client.db('personal-finance');

    const transaction = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection('transactions').insertOne(transaction);
    console.log('Transaction created with ID:', result.insertedId);

    return NextResponse.json({
      ...transaction,
      _id: result.insertedId,
    });
  } catch (error) {
    console.error('Error in POST /api/transactions:', error);

    if (error instanceof Error) {
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        return NextResponse.json(
          { error: 'Database connection failed. Please check your MongoDB connection string.' },
          { status: 503 }
        );
      }
      if (error.message.includes('Authentication failed')) {
        return NextResponse.json(
          { error: 'Database authentication failed. Please check your MongoDB credentials.' },
          { status: 401 }
        );
      }
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    );
  }
}
