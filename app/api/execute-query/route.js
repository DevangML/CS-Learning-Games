import { NextResponse } from 'next/server';
import { getAuthUser } from '../../../lib/api-helpers';
import { getDbPool } from '../../../lib/sql-exec';

export const runtime = 'nodejs';

function compareResultSets(actualRows, expectedRows) {
  const summary = { matches: true, differences: [] };
  const toKeys = (rows) => (rows && rows[0] ? Object.keys(rows[0]) : []);
  const actualCols = toKeys(actualRows);
  const expectedCols = toKeys(expectedRows);
  const setEq = (a, b) => a.length === b.length && a.every((k) => b.includes(k));
  if (!setEq(actualCols, expectedCols)) {
    summary.matches = false;
    summary.differences.push(
      `Column mismatch: got [${actualCols.join(', ')}], expected [${expectedCols.join(', ')}]`
    );
  }
  if ((actualRows?.length || 0) !== (expectedRows?.length || 0)) {
    summary.matches = false;
    summary.differences.push(
      `Row count differs: got ${(actualRows || []).length}, expected ${(expectedRows || []).length}`
    );
  }
  const normalize = (rows, cols) =>
    (rows || [])
      .map((r) => JSON.stringify(cols.reduce((o, c) => ((o[c] = r[c]), o), {})))
      .sort();
  const aNorm = normalize(actualRows, expectedCols.length ? expectedCols : actualCols);
  const eNorm = normalize(expectedRows, expectedCols.length ? expectedCols : actualCols);
  if (aNorm.length !== eNorm.length || aNorm.some((v, i) => v !== eNorm[i])) {
    summary.matches = false;
    summary.differences.push('Row set differs from expected.');
  }
  return summary;
}

export async function POST(request) {
  const user = await getAuthUser(request);
  if (!user) return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  try {
    const { query, expectedQuery } = await request.json();
    const pool = getDbPool();
    if (!pool) return NextResponse.json({ error: 'SQLite database not initialized.' }, { status: 500 });
    if (!query || typeof query !== 'string') return NextResponse.json({ error: 'Query is required' }, { status: 400 });
    const sanitizedQuery = query.trim();
    const ql = sanitizedQuery.toLowerCase();
    const allowedPatterns = [
      /^select\b/,
      /^with\b/,
      /^explain\b/,
      /^show\b/,
      /^(desc|describe)\b/,
      /^insert\b/,
      /^update\b/,
      /^delete\b/,
      /^create\s+(view|index|table|temporary\s+table)\b/,
      /^alter\s+table\b/,
      /^drop\s+(view|index)\b/,
    ];
    const isAllowed = allowedPatterns.some((re) => re.test(ql));
    if (!isAllowed) {
      return NextResponse.json(
        {
          error: 'Query type not allowed',
          message:
            'Allowed: SELECT, WITH (CTE), EXPLAIN, SHOW, DESCRIBE/DESC, INSERT, UPDATE, DELETE, CREATE (VIEW/INDEX/TABLE), ALTER TABLE, DROP (VIEW/INDEX)',
        },
        { status: 400 }
      );
    }
    const [rows] = await pool.execute(sanitizedQuery);
    let comparison = null;
    if (expectedQuery && typeof expectedQuery === 'string') {
      try {
        const expTrim = expectedQuery.trim();
        const expAllowed = allowedPatterns.some((re) => re.test(expTrim.toLowerCase()));
        if (expAllowed) {
          const [expectedRows] = await pool.execute(expTrim);
          comparison = compareResultSets(rows, expectedRows);
        }
      } catch (_) {
        comparison = null;
      }
    }
    return NextResponse.json({ success: true, results: rows, rowCount: rows.length, comparison });
  } catch (e) {
    return NextResponse.json({ error: 'Query execution failed', message: e.message }, { status: 500 });
  }
}

