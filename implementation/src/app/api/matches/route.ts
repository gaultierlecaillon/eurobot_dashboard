import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Match from '@/models/Match';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const series = searchParams.get('series');
    const limit = searchParams.get('limit');

    let query = {};
    if (series) {
      query = { series: parseInt(series) };
    }

    let matchesQuery = Match.find(query).sort({ series: 1, matchNumber: 1 });
    
    if (limit) {
      matchesQuery = matchesQuery.limit(parseInt(limit));
    }

    const matches = await matchesQuery.exec();

    return NextResponse.json({
      success: true,
      data: matches
    });

  } catch (error) {
    console.error('Error fetching matches:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch matches' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const match = new Match(body);
    await match.save();

    return NextResponse.json({
      success: true,
      data: match
    });

  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create match' },
      { status: 500 }
    );
  }
}
