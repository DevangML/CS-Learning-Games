import { NextResponse } from 'next/server';
import { encode, cookieOptions } from '../../../../lib/session';
import { getUserById, createUser, updateUserLogin } from '../../../../lib/user-db';

export const runtime = 'nodejs';

export async function POST() {
  try {
    let user = await getUserById('demo_user_123');
    if (!user) {
      user = await createUser({
        google_id: 'demo_user_123',
        name: 'Demo User',
        email: 'demo@sqlquest.com',
        avatar: 'https://via.placeholder.com/40',
      });
    }
    await updateUserLogin('demo_user_123');

    const secret = process.env.SESSION_SECRET || 'sql-mastery-quest-secret';
    const token = encode({ sub: user.google_id, name: user.name, email: user.email }, secret);

    const res = NextResponse.json({ user, message: 'Demo mode activated' });
    res.headers.set('Set-Cookie', `auth_token=${token}; ${cookieOptions({})}`);
    return res;
  } catch (e) {
    return NextResponse.json({ error: 'Demo setup failed' }, { status: 500 });
  }
}

