import { NextResponse } from 'next/server';
import { verify } from '../../../../lib/session';
import { getUserById } from '../../../../lib/vercel-kv';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/nextauth-options';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    // Prefer NextAuth session (Google OAuth)
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const user = await getUserById(session.user.id);
      return NextResponse.json({ user: user || null });
    }

    // Fallback to Demo Mode cookie
    const cookie = request.headers.get('cookie') || '';
    const token = cookie.split(';').map(s => s.trim()).find(s => s.startsWith('auth_token='))?.split('=')[1];
    if (!token) return NextResponse.json({ user: null });
    const secret = process.env.SESSION_SECRET || 'sql-mastery-quest-secret';
    const payload = verify(token, secret);
    if (!payload?.sub) return NextResponse.json({ user: null });
    const user = await getUserById(payload.sub);
    return NextResponse.json({ user: user || null });
  } catch (e) {
    return NextResponse.json({ user: null });
  }
}
