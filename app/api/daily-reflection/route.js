import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../lib/api-helpers';
import { getDailyReflection, saveDailyReflection } from '../../../lib/user-db';

export const runtime = 'nodejs';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const today = new Date().toISOString().split('T')[0];
    const reflection = await getDailyReflection(user.id, today);
    return NextResponse.json(reflection || null);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const { takeaway } = await request.json();
    if (!takeaway || !takeaway.trim()) {
      return NextResponse.json({ error: 'Takeaway is required' }, { status: 400 });
    }
    const today = new Date().toISOString().split('T')[0];
    await saveDailyReflection(user.id, takeaway.trim(), today);
    return NextResponse.json({ success: true, message: 'Daily reflection saved!' });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

