const { verify } = require('./session');
const { getUserById } = require('./vercel-kv');
const { getServerSession } = require('next-auth');
const { authOptions } = require('./nextauth-options');

async function getAuthUser(request) {
  // First check for NextAuth session (Google OAuth)
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.id) {
      const user = await getUserById(session.user.id);
      if (user) return user;
    }
  } catch (error) {
    // Continue to demo auth if NextAuth fails
  }

  // Fallback to demo mode cookie
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

