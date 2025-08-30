import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  // Delegate to NextAuth's signin flow to manage state/nonces securely
  return NextResponse.redirect(new URL('/api/auth/signin?provider=google', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}
