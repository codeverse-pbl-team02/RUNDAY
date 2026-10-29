import { RoutingError } from './routing.mjs';

export function createRoutingHandler({ route, verifyToken, allowedOrigins = [], now = Date.now, path = '/api/walking-route', bodyLimit = 8192, maxActive = 20 }) {
  const limits = new Map();
  let active = 0;
  return async (request, response) => {
    const headers = { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff', Vary: 'Origin' };
    const send = (status, body) => {
      if (response.destroyed || response.writableEnded) return;
      response.writeHead(status, headers); response.end(status === 204 ? undefined : JSON.stringify(body));
    };
    const origin = request.headers.origin;
    if (origin && !allowedOrigins.includes(origin)) { request.resume(); send(403, { code: 'ORIGIN_DENIED' }); return; }
    if (origin) headers['Access-Control-Allow-Origin'] = origin;
    if (request.url !== path) { request.resume(); send(404, { code: 'NOT_FOUND' }); return; }
    if (request.method === 'OPTIONS') {
      headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';
      headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
      send(204, {}); return;
    }
    if (request.method !== 'POST') { request.resume(); send(405, { code: 'METHOD_NOT_ALLOWED' }); return; }
    let slot;
    let reserved = false;
    try {
      const token = /^Bearer (\S{1,8192})$/.exec(request.headers.authorization || '')?.[1];
      if (!token) throw new RoutingError('UNAUTHENTICATED', 401);
      let user;
      try { user = await verifyToken(token); } catch { throw new RoutingError('UNAUTHENTICATED', 401); }
      if (!user?.uid) throw new RoutingError('UNAUTHENTICATED', 401);
      const time = now();
      for (const [uid, entry] of limits) if (time - entry.at > 60_000 && entry.active === 0) limits.delete(uid);
      slot = limits.get(user.uid);
      if (!slot) {
        if (limits.size >= 10_000) throw new RoutingError('RATE_LIMITED', 429);
        slot = { at: time, count: 0, active: 0 }; limits.set(user.uid, slot);
      }
      if (time - slot.at >= 60_000) { slot.at = time; slot.count = 0; }
      if (slot.count >= 10 || slot.active >= 2 || active >= maxActive) throw new RoutingError('RATE_LIMITED', 429);
      if (!request.headers['content-type']?.startsWith('application/json')) throw new RoutingError('INVALID_REQUEST', 400);
      slot.count++; slot.active++; active++; reserved = true;
      const body = await new Promise((resolve, reject) => {
        let size = 0;
        const chunks = [];
        request.on('data', chunk => {
          size += chunk.length;
          if (size > bodyLimit) { reject(new RoutingError('INVALID_REQUEST', 413)); return; }
          chunks.push(chunk);
        });
        request.on('end', () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))); } catch { reject(new RoutingError('INVALID_REQUEST', 400)); } });
        request.on('error', () => reject(new RoutingError('INVALID_REQUEST', 400)));
      });
      send(200, await route(body));
    } catch (error) {
      request.resume();
      send(error instanceof RoutingError ? error.status : 500,
        { code: error instanceof RoutingError ? error.code : 'INTERNAL_ERROR' });
    } finally { if (reserved) { slot.active--; active--; } }
  };
}
