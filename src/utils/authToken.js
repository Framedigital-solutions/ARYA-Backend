const crypto = require('crypto');

function base64UrlEncode(input) {
  const buf = Buffer.isBuffer(input) ? input : Buffer.from(String(input));
  return buf
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeToString(input) {
  const str = String(input || '').replace(/-/g, '+').replace(/_/g, '/');
  const pad = str.length % 4 ? '='.repeat(4 - (str.length % 4)) : '';
  return Buffer.from(str + pad, 'base64').toString('utf8');
}

function signToken(payload, secret, { expiresInSeconds } = {}) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);

  const body = {
    ...payload,
    iat: now,
    ...(expiresInSeconds ? { exp: now + expiresInSeconds } : {}),
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedBody = base64UrlEncode(JSON.stringify(body));
  const data = `${encodedHeader}.${encodedBody}`;

  const sig = crypto.createHmac('sha256', String(secret)).update(data).digest();
  const encodedSig = base64UrlEncode(sig);

  return `${data}.${encodedSig}`;
}

function verifyToken(token, secret) {
  const parts = String(token || '').split('.');
  if (parts.length !== 3) {
    const err = new Error('Invalid token');
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  const [encodedHeader, encodedBody, encodedSig] = parts;
  const data = `${encodedHeader}.${encodedBody}`;

  const expected = crypto.createHmac('sha256', String(secret)).update(data).digest();
  const actual = Buffer.from(
    String(encodedSig || '').replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (String(encodedSig || '').length % 4)) % 4),
    'base64'
  );

  if (actual.length !== expected.length || !crypto.timingSafeEqual(actual, expected)) {
    const err = new Error('Invalid token');
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  const json = base64UrlDecodeToString(encodedBody);
  let payload;
  try {
    payload = JSON.parse(json);
  } catch (_) {
    const err = new Error('Invalid token');
    err.code = 'INVALID_TOKEN';
    throw err;
  }

  const now = Math.floor(Date.now() / 1000);
  if (payload && typeof payload.exp === 'number' && payload.exp && now >= payload.exp) {
    const err = new Error('Token expired');
    err.code = 'TOKEN_EXPIRED';
    throw err;
  }

  return payload;
}

module.exports = { signToken, verifyToken };
