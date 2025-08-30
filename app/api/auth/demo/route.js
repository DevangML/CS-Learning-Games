import { NextResponse } from 'next/server';
import { encode, cookieOptions } from '../../../../lib/session';
import { getUserById, createUser, updateUserLogin } from '../../../../lib/vercel-kv';

export const runtime = 'nodejs';

export async function POST() {
  try {
    console.log('Demo auth POST request received');
    console.log('Environment check - SESSION_SECRET exists:', !!process.env.SESSION_SECRET);
    console.log('Environment check - KV_REST_API_URL exists:', !!process.env.KV_REST_API_URL);
    
    let user = await getUserById('demo_user_123');
    if (!user) {
      console.log('Creating new demo user');
      user = await createUser({
        google_id: 'demo_user_123',
        name: 'Demo User',
        email: 'demo@sqlquest.com',
        avatar: 'https://via.placeholder.com/40',
      });
    } else {
      console.log('Demo user found:', user.id);
    }
    
    await updateUserLogin('demo_user_123');

    const secret = process.env.SESSION_SECRET || 'sql-mastery-quest-secret';
    const token = encode({ sub: user.google_id, name: user.name, email: user.email }, secret);

    const res = NextResponse.json({ user, message: 'Demo mode activated' });
    res.headers.set('Set-Cookie', `auth_token=${token}; ${cookieOptions({})}`);
    return res;
  } catch (e) {
    console.error('Demo auth error:', e.message, e.stack);
    return NextResponse.json({ error: 'Demo setup failed', details: e.message }, { status: 500 });
  }
}

