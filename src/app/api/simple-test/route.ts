import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  return NextResponse.json({
    success: true,
    message: 'Simple test endpoint working',
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    }
  });
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  return NextResponse.json({
    success: true,
    message: 'POST test endpoint working',
    body: body,
    timestamp: new Date().toISOString()
  });
} 