import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out successfully' });
  res.headers.set('Set-Cookie', `auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
  return res;
}

