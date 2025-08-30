import { NextResponse } from 'next/server';
import { getDbPool } from '../../../lib/sql-exec';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const pool = getDbPool();
    if (!pool) return NextResponse.json({ success: false, error: 'SQLite database not initialized' }, { status: 500 });
    await pool.execute('SELECT 1');
    return NextResponse.json({ success: true, message: 'Database connection is working' });
  } catch (e) {
    return NextResponse.json({ success: false, error: e.message }, { status: 500 });
  }
}

