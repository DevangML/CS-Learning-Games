import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/api-helpers';
import { completeDailyMission } from '../../../../lib/user-db';

export const runtime = 'nodejs';

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const { level_id, question_id } = await request.json();
    const today = new Date().toISOString().split('T')[0];
    const result = await completeDailyMission(user.id, level_id, question_id, today);
    return NextResponse.json({ success: true, completed_count: result.completed_count });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

