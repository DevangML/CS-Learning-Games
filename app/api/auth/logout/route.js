import { NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST() {
  const res = NextResponse.json({ message: 'Logged out successfully' });
  const cookies = [
    'auth_token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    // NextAuth cookies (clear both secure and non-secure variants)
    'next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0',
    '__Secure-next-auth.session-token=; Path=/; HttpOnly; SameSite=None; Secure; Max-Age=0',
    'next-auth.csrf-token=; Path=/; SameSite=Lax; Max-Age=0',
  ];
  res.headers.append('Set-Cookie', cookies[0]);
  for (let i = 1; i < cookies.length; i++) {
    res.headers.append('Set-Cookie', cookies[i]);
  }
  return res;
}
