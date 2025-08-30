const { verify } = require('./session');
const { getUserById } = require('./user-db');

async function getAuthUser(request) {
  const cookie = request.headers.get('cookie') || '';
  const token = cookie
    .split(';')
    .map((s) => s.trim())
    .find((s) => s.startsWith('auth_token='))
    ?.split('=')[1];
  if (!token) return null;
  const secret = process.env.SESSION_SECRET || 'sql-mastery-quest-secret';
  const payload = verify(token, secret);
  if (!payload?.sub) return null;
  const user = await getUserById(payload.sub);
  return user || null;
}

module.exports = { getAuthUser };

