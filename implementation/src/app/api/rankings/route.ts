import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import TeamRanking from '@/models/TeamRanking';

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

    let rankingsQuery = TeamRanking.find(query).sort({ series: 1, position: 1 });
    
    if (limit) {
      rankingsQuery = rankingsQuery.limit(parseInt(limit));
    }

    const rankings = await rankingsQuery.exec();

    return NextResponse.json({
      success: true,
      data: rankings
    });

  } catch (error) {
    console.error('Error fetching rankings:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch rankings' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const ranking = new TeamRanking(body);
    await ranking.save();

    return NextResponse.json({
      success: true,
      data: ranking
    });

  } catch (error) {
    console.error('Error creating ranking:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create ranking' },
      { status: 500 }
    );
  }
}
