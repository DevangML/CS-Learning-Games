import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../../lib/api-helpers';

export const runtime = 'nodejs';

export async function GET(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  return NextResponse.json({ user });
}

