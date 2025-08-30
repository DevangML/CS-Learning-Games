import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../lib/api-helpers';
import { getWeeklyRecap } from '../../../lib/vercel-kv';

export const runtime = 'nodejs';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const reflections = await getWeeklyRecap(user.id);
    return NextResponse.json(reflections || []);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

