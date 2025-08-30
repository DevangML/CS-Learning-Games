import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/api-helpers';
import { completeWeeklyQuest } from '../../../../lib/user-db';

export const runtime = 'nodejs';

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const result = await completeWeeklyQuest(user.id);
    return NextResponse.json({ success: true, completed: !!result.reward, reward: result.reward || null });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

