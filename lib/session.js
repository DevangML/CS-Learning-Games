const crypto = require('crypto');

// Minimal JWT (HS256) utilities for session cookies
function base64url(input) {
  return Buffer.from(input)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function sign(data, secret) {
  return base64url(
    crypto.createHmac('sha256', secret).update(data).digest()
  );
}

function encode(payload, secret, expiresInSec = 30 * 24 * 60 * 60) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { iat: now, exp: now + expiresInSec, ...payload };
  const headerPart = base64url(JSON.stringify(header));
  const bodyPart = base64url(JSON.stringify(body));
  const unsigned = `${headerPart}.${bodyPart}`;
  const signature = sign(unsigned, secret);
  return `${unsigned}.${signature}`;
}

function decode(token) {
  try {
    const [, payload] = token.split('.');
    return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

function verify(token, secret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expected = sign(`${header}.${body}`, secret);
    if (signature !== expected) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64').toString('utf8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

function cookieOptions({ maxAge = 30 * 24 * 60 * 60 } = {}) {
  // HttpOnly, SameSite=Lax, Path=/, Secure in production
  const attrs = [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    process.env.NODE_ENV === 'production' ? 'Secure' : null,
    `Max-Age=${maxAge}`,
  ].filter(Boolean);
  return attrs.join('; ');
}

module.exports = {
  encode,
  verify,
  decode,
  cookieOptions,
};

