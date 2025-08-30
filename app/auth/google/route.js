import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function GET() {
  // OAuth not configured in this Next.js migration (Demo Mode supported)
  return NextResponse.redirect(new URL('/?error=oauth_not_configured', process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'));
}

