import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../lib/api-helpers';
import { getDailyMissions } from '../../../lib/vercel-kv';

export const runtime = 'nodejs';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const today = new Date().toISOString().split('T')[0];
    const missions = await getDailyMissions(user.id, today);
    return NextResponse.json(missions);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

