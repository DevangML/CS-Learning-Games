import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/api-helpers';
import { completeStreakRecoveryMission } from '../../../../lib/vercel-kv';

export const runtime = 'nodejs';

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const result = await completeStreakRecoveryMission(user.id);
    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

