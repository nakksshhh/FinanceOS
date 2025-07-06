import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { budgetSchema } from '@/lib/validations';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    const budgets = await db
      .collection('budgets')
      .find({})
      .sort({ year: -1, month: -1 })
      .toArray();
    
    return NextResponse.json(budgets);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch budgets' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validatedData = budgetSchema.parse(body);
    
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const budget = {
      ...validatedData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const result = await db.collection('budgets').insertOne(budget);
    
    return NextResponse.json({
      ...budget,
      _id: result.insertedId,
    });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create budget' },
      { status: 500 }
    );
  }
}