const WORKER_PROXY = 'https://fragrant-unit-a421.dadsondankstry.workers.dev/?url=';
const FALLBACK_STATUSES = new Set([403, 404, 408, 409, 425, 429, 500, 502, 503, 504]);

function normalizeTarget(raw) {
  try {
    let target = String(raw || '').trim();
    if (!target) return '';
    target = target.replace(/&amp;/g, '&').replace(/&#038;/g, '&');
    if (/^\/\//.test(target)) target = 'https:' + target;
    if (!/^https?:\/\//i.test(target)) return '';
    return target;
  } catch (e) {
    return '';
  }
}

function mustPreferWorker(target) {
  return /(^|\.)boraflix\.click\b|(^|\.)boraflixtv\.com\b|(^|\.)lisoflix\.net\b|primeflix/i.test(target);
}

function shouldFallback(resp) {
  if (!resp) return true;
  return FALLBACK_STATUSES.has(resp.status);
}

function requestHeaders(req, target) {
  let origin = '';
  try { origin = new URL(target).origin; } catch (e) {}
  return {
    'user-agent': req.headers['user-agent'] || 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124 Safari/537.36',
    'accept': req.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'accept-language': req.headers['accept-language'] || 'pt-BR,pt;q=0.9,en;q=0.8',
    'cache-control': 'no-cache',
    'pragma': 'no-cache',
    ...(origin ? {'referer': origin + '/'} : {})
  };
}

async function fetchWithTimeout(url, options, timeoutMs = 24000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function fetchDirect(target, req) {
  return fetchWithTimeout(target, {
    method: 'GET',
    redirect: 'follow',
    headers: requestHeaders(req, target)
  });
}

async function fetchWorker(target, req) {
  return fetchWithTimeout(WORKER_PROXY + encodeURIComponent(target), {
    method: 'GET',
    redirect: 'follow',
    headers: {
      'user-agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'accept': req.headers['accept'] || '*/*',
      'accept-language': req.headers['accept-language'] || 'pt-BR,pt;q=0.9,en;q=0.8',
      'cache-control': 'no-cache',
      'pragma': 'no-cache'
    }
  });
}

async function tryFetch(target, req) {
  let first = mustPreferWorker(target) ? 'worker' : 'direct';
  let second = first === 'worker' ? 'direct' : 'worker';

  const run = (kind) => kind === 'worker' ? fetchWorker(target, req) : fetchDirect(target, req);

  let resp = null;
  try { resp = await run(first); } catch (e) { resp = null; }
  if (shouldFallback(resp)) {
    try {
      const alt = await run(second);
      if (alt && (!resp || alt.ok || !FALLBACK_STATUSES.has(alt.status))) resp = alt;
    } catch (e) {}
  }
  return resp;
}

export default async function handler(req, res) {
  try {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type,Range,Accept,User-Agent');
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    const pageUrl = new URL(req.url, `https://${req.headers.host || 'localhost'}`);
    const target = normalizeTarget(pageUrl.searchParams.get('url'));
    if (!target) {
      res.status(400).send('URL inválida');
      return;
    }

    const upstream = await tryFetch(target, req);
    if (!upstream) {
      res.status(502).send('Erro no proxy');
      return;
    }

    const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
    const body = Buffer.from(await upstream.arrayBuffer());

    res.setHeader('Content-Type', contentType);
    res.setHeader('Access-Control-Expose-Headers', 'Content-Type,Content-Length,Accept-Ranges,Content-Range');
    res.status(upstream.status).send(body);
  } catch (err) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
    res.status(500).send('Erro no proxy');
  }
}
