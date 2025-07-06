import { NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import clientPromise from '@/lib/mongodb';
import { budgetSchema } from '@/lib/validations';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const validatedData = budgetSchema.parse(body);
    
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const result = await db.collection('budgets').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          ...validatedData,
          updatedAt: new Date(),
        },
      }
    );
    
    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to update budget' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('personal-finance');
    
    const result = await db.collection('budgets').deleteOne({
      _id: new ObjectId(params.id),
    });
    
    if (result.deletedCount === 0) {
      return NextResponse.json(
        { error: 'Budget not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete budget' },
      { status: 500 }
    );
  }
}