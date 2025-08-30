import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/api-helpers';
import { getUserProgress, upsertUserProgress } from '../../../../lib/vercel-kv';

export const runtime = 'nodejs';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const progress = await getUserProgress(user.id);
    return NextResponse.json({ progress: progress || [] });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const body = await request.json();
    const { level_id, question_id, completed, xp_earned, hints_used } = body;
    const totals = await upsertUserProgress(user.id, {
      level_id,
      question_id,
      completed,
      xp_earned,
      hints_used,
    });
    return NextResponse.json({ success: true, ...totals });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

