export class RoutingError extends Error {
  constructor(code, status) { super(code); this.code = code; this.status = status; }
}

export const validPoint = p => p && typeof p.latitude === 'number' && typeof p.longitude === 'number'
  && Number.isFinite(p.latitude) && Math.abs(p.latitude) <= 90 && Number.isFinite(p.longitude) && Math.abs(p.longitude) <= 180;

export function meters(a, b) {
  const r = Math.PI / 180;
  const h = Math.sin((b.latitude - a.latitude) * r / 2) ** 2
    + Math.cos(a.latitude * r) * Math.cos(b.latitude * r) * Math.sin((b.longitude - a.longitude) * r / 2) ** 2;
  return 6371000 * 2 * Math.asin(Math.sqrt(Math.min(1, h)));
}

export function validateRequest(body) {
  for (const p of [body?.start, body?.end]) {
    if (!validPoint(p) || typeof p.label !== 'string' || !p.label.trim() || p.label.length > 100) {
      throw new RoutingError('INVALID_REQUEST', 400);
    }
  }
  const distance = meters(body.start, body.end);
  if (distance < 20 || distance > 30_000) throw new RoutingError('INVALID_REQUEST', 400);
  const endpoint = p => ({ label: p.label.trim(), latitude: p.latitude, longitude: p.longitude });
  return { start: endpoint(body.start), end: endpoint(body.end) };
}
