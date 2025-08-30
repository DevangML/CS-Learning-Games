import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request) {
  // Redirect legacy callback path to NextAuth's handler, preserving query string (code, state)
  const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
  const url = new URL(request.url);
  const dest = new URL('/api/auth/callback/google', base);
  dest.search = url.search; // forward ?code=...&state=...
  return NextResponse.redirect(dest);
}
