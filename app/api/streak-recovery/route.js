import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../lib/api-helpers';
import { getStreakRecovery } from '../../../lib/user-db';

export const runtime = 'nodejs';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const recovery = await getStreakRecovery(user.id);
    return NextResponse.json(recovery || null);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

