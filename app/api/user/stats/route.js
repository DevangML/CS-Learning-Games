import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/api-helpers';
import { getUserStats } from '../../../../lib/vercel-kv';

export const runtime = 'nodejs';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const stats = await getUserStats(user.id);
    return NextResponse.json(stats || {});
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

