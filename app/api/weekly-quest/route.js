import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../lib/api-helpers';
import { getWeeklyQuest } from '../../../lib/vercel-kv';

export const runtime = 'nodejs';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const quest = await getWeeklyQuest(user.id);
    return NextResponse.json(quest);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

