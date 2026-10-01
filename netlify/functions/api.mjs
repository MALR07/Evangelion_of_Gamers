import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pg from 'pg';
import { createPublicKey, randomBytes, verify as verifySignature } from 'node:crypto';

const { Pool } = pg;
let pool;
let usernameSchemaReady;
let newsCache = { expiresAt: 0, entries: [] };
let spotlightCache = { expiresAt: 0, games: [] };
let googleJwksCache = { expiresAt: 0, keys: [] };

const NEWS_FEEDS = [
  { name: 'Vandal', url: 'https://vandal.elespanol.com/xml.cgi', host: 'vandal.elespanol.com' },
  { name: 'Hobby Consolas', url: 'https://www.hobbyconsolas.com/rss', host: 'www.hobbyconsolas.com' }
];

function database() {
  if (!process.env.DATABASE_URL) throw new Error('Falta configurar DATABASE_URL.');
  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 2,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
  });
  return pool;
}

function ensureUsernameSchema() {
  usernameSchemaReady ??= (async () => {
    const db = database();
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS username TEXT');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_image_url TEXT');
    await db.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT \'user\'');
    await db.query("UPDATE users SET username = 'Jugador-' || id::text WHERE username IS NULL OR btrim(username) = ''");
    await db.query('ALTER TABLE users ALTER COLUMN username SET NOT NULL');
    await db.query('CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx ON users (LOWER(username))');
    const adminEmail = 'admin@savepoint.com';
    const adminHash = await bcrypt.hash('admin17', 12);
    await db.query(
      `INSERT INTO users (email, username, password_hash, role, profile_image_url)
       VALUES ($1, $2, $3, 'admin', NULL)
       ON CONFLICT (email) DO NOTHING`,
      [adminEmail, 'admin', adminHash]
    );
  })().catch((error) => {
    usernameSchemaReady = null;
    throw error;
  });
  return usernameSchemaReady;
}

function response(statusCode, body) {
  return { statusCode, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(body) };
}

function decodeJwtPart(value) {
  return JSON.parse(Buffer.from(value, 'base64url').toString('utf8'));
}

function repairFeedText(value) {
  let text = String(value ?? '');
  if (/[ÃÂ]/.test(text)) {
    try { text = Buffer.from(text, 'latin1').toString('utf8'); } catch {}
  }
  return text
    .replaceAll('llegar�', 'llegará')
    .replaceAll('m�viles', 'móviles')
    .replaceAll('an�lisis', 'análisis')
    .replaceAll('nominaci�n', 'nominación')
    .replaceAll('videoj�', 'videojue');
}

async function googleIdentity(credential) {
  if (!process.env.GOOGLE_CLIENT_ID) throw new Error('Google no está configurado todavía.');
  const parts = String(credential ?? '').split('.');
  if (parts.length !== 3) throw new Error('La credencial de Google no es válida.');
  const header = decodeJwtPart(parts[0]);
  const claims = decodeJwtPart(parts[1]);
  if (header.alg !== 'RS256' || (claims.iss !== 'https://accounts.google.com' && claims.iss !== 'accounts.google.com') || claims.aud !== process.env.GOOGLE_CLIENT_ID || !claims.email_verified || Number(claims.exp) <= Math.floor(Date.now() / 1000)) {
    throw new Error('No se pudo verificar la cuenta de Google.');
  }
  if (googleJwksCache.expiresAt <= Date.now()) {
    const result = await fetch('https://www.googleapis.com/oauth2/v3/certs', { signal: AbortSignal.timeout(8000) });
    if (!result.ok) throw new Error('No se pudieron consultar las claves de Google.');
    const cacheControl = result.headers.get('cache-control') ?? '';
    const maxAge = Number(cacheControl.match(/max-age=(\d+)/i)?.[1] ?? 3600);
    googleJwksCache = { expiresAt: Date.now() + maxAge * 1000, keys: (await result.json()).keys ?? [] };
  }
  const jwk = googleJwksCache.keys.find((key) => key.kid === header.kid);
  if (!jwk) throw new Error('La clave de Google ha caducado; inténtalo de nuevo.');
  const valid = verifySignature('RSA-SHA256', Buffer.from(`${parts[0]}.${parts[1]}`), createPublicKey({ key: jwk, format: 'jwk' }), Buffer.from(parts[2], 'base64url'));
  if (!valid) throw new Error('La firma de Google no es válida.');
  return { email: String(claims.email).trim().toLowerCase(), name: String(claims.name ?? 'Jugador').trim(), profileImage: claims.picture ? String(claims.picture) : null };
}

function decodeXmlEntities(value) {
  return repairFeedText(String(value ?? '')
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&#(\d+);|&#x([\da-f]+);|&(amp|lt|gt|quot|apos);/gi, (entity, decimal, hex, named) => {
      if (decimal || hex) {
        const codePoint = Number.parseInt(decimal ?? hex, hex ? 16 : 10);
        return codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : entity;
      }
      return {
        amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
        lsquo: '‘', rsquo: '’', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', bull: '•'
      }[named.toLowerCase()] ?? entity;
    }))
}

function decodeFeedXml(bytes) {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}

function rssField(item, tag) {
  const escapedTag = tag.replace(':', '\\:');
  const match = item.match(new RegExp(`<${escapedTag}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapedTag}>`, 'i'));
  return match ? decodeXmlEntities(match[1]).trim() : '';
}

function parseNewsFeed(xml, source) {
  return [...xml.matchAll(/<item\b[^>]*>([\s\S]*?)<\/item>/gi)].flatMap(([, item]) => {
    const title = rssField(item, 'title');
    const url = rssField(item, 'link');
    const descriptionHtml = rssField(item, 'description');
    const category = rssField(item, 'category');
    const publishedAt = rssField(item, 'pubDate');
    const timestamp = Date.parse(publishedAt);
    if (!title || !url || !Number.isFinite(timestamp) || timestamp < Date.now() - 30 * 24 * 60 * 60 * 1000) return [];
    if (source.name === 'Hobby Consolas' && category.toLowerCase() !== 'juegos') return [];

    let articleUrl;
    try { articleUrl = new URL(url); } catch { return []; }
    if (articleUrl.protocol !== 'https:' || articleUrl.hostname !== source.host) return [];

    const enclosure = item.match(/<(?:enclosure|media:content)\b[^>]*\burl=["']([^"']+)["']/i);
    const inlineImage = descriptionHtml.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i);
    const image = decodeXmlEntities(enclosure?.[1] ?? inlineImage?.[1] ?? '');
    const description = descriptionHtml.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 220);
    const isAnalysis = source.name === 'Hobby Consolas' && /\banálisis\b/i.test(title);
    return [{ id: `${source.name}-${articleUrl.pathname}`, title, subtitle: isAnalysis ? `${source.name} · Análisis` : source.name, section: isAnalysis ? 'analysis' : 'news', description, image, url: articleUrl.href, publishedAt }];
  });
}

async function gamingNews() {
  if (newsCache.expiresAt > Date.now()) return newsCache.entries;
  const feeds = await Promise.allSettled(NEWS_FEEDS.map(async (source) => {
    const result = await fetch(source.url, {
      headers: { accept: 'application/rss+xml, application/xml, text/xml' },
      signal: AbortSignal.timeout(12000)
    });
    if (!result.ok) throw new Error(`Feed ${source.name} respondió ${result.status}.`);
    return parseNewsFeed(decodeFeedXml(await result.arrayBuffer()), source);
  }));
  const entries = [...new Map(feeds
    .flatMap((feed) => feed.status === 'fulfilled' ? feed.value : [])
    .map((entry) => [entry.url, entry])).values()];
  entries.sort((left, right) => Date.parse(right.publishedAt) - Date.parse(left.publishedAt));
  if (entries.length) {
    newsCache = { expiresAt: Date.now() + 5 * 60 * 1000, entries: entries.slice(0, 24) };
  } else {
    newsCache.expiresAt = Date.now() + 60 * 1000;
  }
  return newsCache.entries;
}

async function randomGameSpotlight() {
  if (spotlightCache.expiresAt <= Date.now()) {
    const featuredSearches = [
      'Destiny 2',
      'Persona 5 Royal',
      'Silent Hill 2 Remake',
      'God of War Ragnarök',
      'Marvel’s Spider-Man 2',
      'Alan Wake 2',
      'The Last of Us Part I',
      'Call of Duty: Black Ops III',
      'Death Stranding 2: On the Beach',
      'Marvel’s Lobezno',
      'NieR: Automata',
      'Helldivers 2',
      'Bloodborne',
      'Cyberpunk 2077'
    ];
    const featuredResults = await Promise.allSettled(featuredSearches.map((search) => rawg('games', { search, page_size: '3' })));
    const featuredGames = featuredResults.flatMap((result) => result.status === 'fulfilled'
      ? (result.value.results ?? []).filter((game) => game.background_image).slice(0, 2)
      : []);
    const uniqueGames = [...new Map(featuredGames.map((game) => [String(game.id), game])).values()];
    const data = uniqueGames.length ? { results: uniqueGames } : await rawg('games', { ordering: '-added', page_size: '40' });
    spotlightCache = {
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
      games: (data.results ?? []).filter((game) => game.background_image).map((game) => ({
        id: String(game.id),
        name: game.name,
        slug: game.slug,
        backgroundImage: game.background_image,
        released: game.released,
        rating: game.rating
      }))
    };
  }
  const games = spotlightCache.games;
  return games.length ? games[Math.floor(Math.random() * games.length)] : null;
}

function tokenFor(user) {
  if (!process.env.JWT_SECRET) throw new Error('Falta configurar JWT_SECRET.');
  return jwt.sign({ sub: String(user.id), email: user.email, username: user.username, role: user.role ?? 'user' }, process.env.JWT_SECRET, { expiresIn: '14d' });
}

function getUser(event) {
  const token = event.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token || !process.env.JWT_SECRET) return null;
  try { return jwt.verify(token, process.env.JWT_SECRET); } catch { return null; }
}

async function isAdmin(user) {
  const result = await database().query('SELECT role FROM users WHERE id = $1', [user.sub]);
  return result.rows[0]?.role === 'admin';
}

async function rawg(path, params = {}) {
  if (!process.env.RAWG_API_KEY) throw new Error('Falta configurar RAWG_API_KEY para buscar videojuegos.');
  const url = new URL(`https://api.rawg.io/api/${path}`);
  url.searchParams.set('key', process.env.RAWG_API_KEY);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const result = await fetch(url);
  if (!result.ok) throw new Error(`RAWG respondió con estado ${result.status}.`);
  return result.json();
}

async function ensureListsTable() {
  await database().query(`
    CREATE TABLE IF NOT EXISTS user_lists (
      id BIGSERIAL PRIMARY KEY,
      user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      title TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 120),
      year SMALLINT CHECK (year BETWEEN 1900 AND 2200),
      sections JSONB NOT NULL DEFAULT '[]'::jsonb,
      is_public BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
  await database().query('ALTER TABLE user_lists ADD COLUMN IF NOT EXISTS is_public BOOLEAN NOT NULL DEFAULT FALSE');
}

function validateList(body) {
  const title = String(body.title ?? '').trim();
  const year = body.year === null || body.year === '' ? null : Number(body.year);
  if (!title || title.length > 120) return { error: 'El título debe tener entre 1 y 120 caracteres.' };
  if (year !== null && (!Number.isInteger(year) || year < 1900 || year > 2200)) {
    return { error: 'Introduce un año válido entre 1900 y 2200.' };
  }
  if (!Array.isArray(body.sections) || body.sections.length > 30) return { error: 'La lista puede tener hasta 30 secciones.' };

  const sections = [];
  for (const section of body.sections) {
    const name = String(section.name ?? '').trim();
    const icon = String(section.icon ?? '').trim().slice(0, 8);
    if (!name || name.length > 100 || !Array.isArray(section.items) || section.items.length > 100) {
      return { error: 'Revisa los nombres y las entradas de las secciones.' };
    }
    const items = [];
    for (const item of section.items) {
      const itemTitle = String(item.title ?? '').trim();
      const note = String(item.note ?? '').trim();
      if (!itemTitle || itemTitle.length > 160 || note.length > 200) {
        return { error: 'Cada juego necesita un nombre (máximo 160 caracteres); las notas admiten hasta 200.' };
      }
      const rawgId = item.rawgId ? String(item.rawgId) : null;
      if (rawgId && rawgId.length > 64) return { error: 'La referencia del videojuego no es válida.' };
      items.push({ title: itemTitle, note, ...(rawgId ? { rawgId } : {}) });
    }
    sections.push({ name, icon, items });
  }

  return { value: { title, year, sections } };
}

async function handleApiEvent(event) {
  try {
    const path = new URL(event.rawUrl).pathname
      .replace(/^\/\.netlify\/functions\/api/, '')
      .replace(/^\/api/, '') || '/';
    const method = event.httpMethod;
    const body = event.body ? JSON.parse(event.body) : {};

    if (method === 'GET' && path === '/news') {
      return response(200, { news: await gamingNews() });
    }

    if (method === 'GET' && path === '/spotlight') {
      return response(200, { game: await randomGameSpotlight() });
    }

    await ensureUsernameSchema();

    if (method === 'POST' && path === '/auth/register') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const username = String(body.username ?? '').trim();
      const password = String(body.password ?? '');
      if (!/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || !/^[a-zA-Z0-9_-]{3,24}$/.test(username)) {
        return response(400, { error: 'Introduce un correo válido, un nombre de usuario de 3 a 24 caracteres (letras, números, _ o -) y una contraseña de al menos 8 caracteres.' });
      }
      const passwordHash = await bcrypt.hash(password, 12);
      const result = await database().query(
        'INSERT INTO users (email, username, password_hash) VALUES ($1, $2, $3) RETURNING id, email, username, role, profile_image_url AS "profileImage"',
        [email, username, passwordHash]
      );
      const user = result.rows[0];
      return response(201, { token: tokenFor(user), user: { id: user.id, email: user.email, username: user.username, role: user.role, profileImage: user.profileImage } });
    }

    if (method === 'POST' && path === '/auth/login') {
      const email = String(body.email ?? '').trim().toLowerCase();
      const password = String(body.password ?? '');
      if (!email || !password) {
        return response(400, { error: 'Introduce email y contraseña.' });
      }
      const result = await database().query('SELECT id, email, username, role, profile_image_url AS "profileImage", password_hash FROM users WHERE email = $1', [email]);
      if (!result.rowCount || !(await bcrypt.compare(password, result.rows[0].password_hash))) {
        return response(401, { error: 'Correo o contraseña incorrectos.' });
      }
      const user = result.rows[0];
      return response(200, { token: tokenFor(user), user: { id: user.id, email: user.email, username: user.username, role: user.role, profileImage: user.profileImage } });
    }

    if (method === 'POST' && path === '/auth/google') {
      const identity = await googleIdentity(body.credential);
      const existing = await database().query('SELECT id, email, username, role, profile_image_url AS "profileImage" FROM users WHERE email = $1', [identity.email]);
      let user = existing.rows[0];
      if (!user) {
        const base = identity.name.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 15) || 'jugador';
        let username = base;
        let suffix = 1;
        while ((await database().query('SELECT 1 FROM users WHERE LOWER(username) = LOWER($1)', [username])).rowCount) {
          username = `${base.slice(0, 24 - String(suffix).length - 1)}-${suffix}`;
          suffix += 1;
        }
        const passwordHash = await bcrypt.hash(randomBytes(32).toString('hex'), 12);
        const result = await database().query(
          'INSERT INTO users (email, username, password_hash, profile_image_url) VALUES ($1, $2, $3, $4) RETURNING id, email, username, role, profile_image_url AS "profileImage"',
          [identity.email, username, passwordHash, identity.profileImage]
        );
        user = result.rows[0];
      }
      return response(200, { token: tokenFor(user), user: { id: user.id, email: user.email, username: user.username, role: user.role, profileImage: user.profileImage } });
    }

    if (method === 'GET' && path === '/public/lists') {
      await ensureListsTable();
      const result = await database().query(`
        SELECT public_list.id::text AS id, public_list.user_id AS "userId", public_list.title, public_list.year, public_list.sections,
          public_list.updated_at AS "updatedAt", public_list.is_public AS "isPublic",
          owner.username, owner.profile_image_url AS "profileImage",
          COALESCE((
            SELECT jsonb_agg(jsonb_build_object('rawgId', entry.rawg_id, 'backgroundImage', entry.background_image))
            FROM game_entries entry
            WHERE entry.user_id = public_list.user_id
              AND entry.background_image IS NOT NULL
              AND entry.rawg_id IN (
                SELECT item.value->>'rawgId'
                FROM jsonb_array_elements(public_list.sections) AS section(value)
                CROSS JOIN LATERAL jsonb_array_elements(section.value->'items') AS item(value)
              )
          ), '[]'::jsonb) AS covers
        FROM user_lists public_list
        JOIN users owner ON owner.id = public_list.user_id
        WHERE public_list.is_public = TRUE
        ORDER BY public_list.updated_at DESC, public_list.id DESC
      `);
      const lists = await Promise.all(result.rows.map(async (list) => {
        const sectionsSource = Array.isArray(list.sections) ? list.sections : [];
        const rawgIds = sectionsSource.flatMap((section) => Array.isArray(section.items) ? section.items : []).map((item) => String(item.rawgId ?? '')).filter(Boolean);
        const metadata = rawgIds.length
          ? await database().query('SELECT rawg_id AS "rawgId", rating, platinum, replayed, recommended, notes FROM game_entries WHERE user_id = $1 AND rawg_id = ANY($2::text[])', [list.userId, rawgIds])
          : { rows: [] };
        const metadataById = new Map(metadata.rows.map((entry) => [String(entry.rawgId), entry]));
        const sections = sectionsSource.map((section) => ({
          ...section,
          items: (Array.isArray(section.items) ? section.items : []).map((item) => ({ ...item, gameMeta: item.rawgId ? metadataById.get(String(item.rawgId)) ?? null : null }))
        }));
        const { userId, ...publicList } = list;
        return { ...publicList, sections };
      }));
      return response(200, { lists });
    }

    const user = getUser(event);
    if (!user) return response(401, { error: 'Inicia sesión para continuar.' });

    if (method === 'GET' && path === '/auth/me') {
      const result = await database().query('SELECT username, role, profile_image_url AS "profileImage" FROM users WHERE id = $1', [user.sub]);
      return response(200, { user: { id: user.sub, email: user.email, username: result.rows[0]?.username, role: result.rows[0]?.role ?? user.role ?? 'user', profileImage: result.rows[0]?.profileImage ?? null } });
    }

    if (method === 'PATCH' && path === '/auth/profile') {
      const username = String(body.username ?? '').trim();
      const imageValue = String(body.profileImage ?? '').trim();
      if (!/^[a-zA-Z0-9_-]{3,24}$/.test(username)) {
        return response(400, { error: 'El nombre de usuario debe tener entre 3 y 24 caracteres (letras, números, _ o -).' });
      }
      if (imageValue.length > 2048) return response(400, { error: 'La URL de la foto no puede superar 2048 caracteres.' });
      let profileImage = null;
      if (imageValue) {
        try {
          const imageUrl = new URL(imageValue);
          if (imageUrl.protocol !== 'https:') throw new Error('invalid protocol');
          profileImage = imageUrl.toString();
        } catch {
          return response(400, { error: 'Introduce una URL válida de imagen que empiece por https://.' });
        }
      }
      const result = await database().query(
        'UPDATE users SET username = $1, profile_image_url = $2 WHERE id = $3 RETURNING id, email, username, role, profile_image_url AS "profileImage"',
        [username, profileImage, user.sub]
      );
      return result.rowCount ? response(200, { user: result.rows[0] }) : response(404, { error: 'No se encontró la cuenta.' });
    }

    if (method === 'PATCH' && path === '/auth/password') {
      const currentPassword = String(body.currentPassword ?? '');
      const newPassword = String(body.newPassword ?? '');
      if (newPassword.length < 8) return response(400, { error: 'La nueva contraseña debe tener al menos 8 caracteres.' });
      const result = await database().query('SELECT password_hash FROM users WHERE id = $1', [user.sub]);
      if (!result.rowCount || !(await bcrypt.compare(currentPassword, result.rows[0].password_hash))) {
        return response(401, { error: 'La contraseña actual no coincide.' });
      }
      const passwordHash = await bcrypt.hash(newPassword, 12);
      await database().query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, user.sub]);
      return response(200, { ok: true });
    }

    if (method === 'GET' && path === '/search') {
      const query = new URL(event.rawUrl).searchParams.get('q')?.trim();
      if (!query) return response(200, { results: [] });
      const data = await rawg('games', { search: query, page_size: '8' });
      return response(200, { results: data.results.map((game) => ({
        id: String(game.id),
        name: game.name,
        background_image: game.background_image,
        released: game.released,
        rating: game.rating,
        genres: game.genres?.map((genre) => genre.name) ?? []
      })) });
    }

    const achievementsMatch = path.match(/^\/games\/([^/]+)\/achievements$/);
    if (method === 'GET' && achievementsMatch) {
      const data = await rawg(`games/${encodeURIComponent(achievementsMatch[1])}/achievements`, { page_size: '10' });
      return response(200, { results: data.results ?? [] });
    }

    if (method === 'GET' && path === '/games') {
      const result = await database().query(
        'SELECT id, rawg_id AS "rawgId", name, background_image AS "backgroundImage", released, rating, status, platinum, replayed, recommended, notes FROM game_entries WHERE user_id = $1 ORDER BY created_at DESC',
        [user.sub]
      );
      return response(200, { games: result.rows });
    }

    if (path === '/lists' && ['GET', 'POST'].includes(method)) {
      await ensureListsTable();
      if (method === 'GET') {
        const result = await database().query(
          'SELECT id::text AS id, title, year, sections, is_public AS "isPublic", updated_at AS "updatedAt" FROM user_lists WHERE user_id = $1 ORDER BY updated_at DESC, id DESC',
          [user.sub]
        );
        return response(200, { lists: result.rows });
      }
      const parsed = validateList(body);
      if (parsed.error) return response(400, { error: parsed.error });
      const { title, year, sections } = parsed.value;
      const isPublic = body.isPublic === true;
      const result = await database().query(
        'INSERT INTO user_lists (user_id, title, year, sections, is_public) VALUES ($1, $2, $3, $4, $5) RETURNING id::text AS id, title, year, sections, is_public AS "isPublic", updated_at AS "updatedAt"',
        [user.sub, title, year, JSON.stringify(sections), isPublic]
      );
      return response(201, { list: result.rows[0] });
    }

    if (method === 'GET' && path === '/admin/users') {
      if (!(await isAdmin(user))) return response(403, { error: 'No tienes permisos de administrador.' });
      const result = await database().query(
        'SELECT id, email, username, role, created_at AS "createdAt" FROM users ORDER BY created_at DESC'
      );
      return response(200, { users: result.rows });
    }

    if (method === 'PATCH' && path.startsWith('/admin/users/')) {
      if (!(await isAdmin(user))) return response(403, { error: 'No tienes permisos de administrador.' });
      const targetId = path.split('/')[3];
      if (!targetId) return response(400, { error: 'Falta el usuario objetivo.' });
      if (body.newPassword !== undefined) {
        const newPassword = String(body.newPassword);
        if (newPassword.length < 8 || newPassword.length > 128) return response(400, { error: 'La contraseña debe tener entre 8 y 128 caracteres.' });
        const passwordHash = await bcrypt.hash(newPassword, 12);
        const result = await database().query('UPDATE users SET password_hash = $1 WHERE id = $2', [passwordHash, targetId]);
        return result.rowCount ? response(200, { ok: true }) : response(404, { error: 'No se encontró la cuenta.' });
      }
      if (!['admin', 'user'].includes(body.role)) return response(400, { error: 'El permiso indicado no es válido.' });
      if (String(targetId) === String(user.sub)) return response(400, { error: 'No puedes cambiar tus propios permisos.' });
      const result = await database().query('UPDATE users SET role = $1 WHERE id = $2', [body.role, targetId]);
      return result.rowCount ? response(200, { ok: true }) : response(404, { error: 'No se encontró la cuenta.' });
    }

    if (method === 'DELETE' && path.startsWith('/admin/users/')) {
      if (!(await isAdmin(user))) return response(403, { error: 'No tienes permisos de administrador.' });
      const targetId = path.split('/')[3];
      if (!targetId) return response(400, { error: 'Falta el usuario objetivo.' });
      if (Number(targetId) === Number(user.sub)) return response(400, { error: 'No puedes eliminar tu propia cuenta desde administración.' });
      await database().query('DELETE FROM users WHERE id = $1', [targetId]);
      return response(200, { ok: true });
    }

    const listMatch = path.match(/^\/lists\/([0-9]+)$/);
    if (listMatch && ['PATCH', 'DELETE'].includes(method)) {
      await ensureListsTable();
      if (method === 'DELETE') {
        const result = await database().query('DELETE FROM user_lists WHERE user_id = $1 AND id = $2', [user.sub, listMatch[1]]);
        return result.rowCount ? response(200, { ok: true }) : response(404, { error: 'No se encontró la lista.' });
      }
      const parsed = validateList(body);
      if (parsed.error) return response(400, { error: parsed.error });
      const { title, year, sections } = parsed.value;
      const isPublic = typeof body.isPublic === 'boolean' ? body.isPublic : null;
      const result = await database().query(
        'UPDATE user_lists SET title = $1, year = $2, sections = $3, is_public = COALESCE($4, is_public), updated_at = NOW() WHERE user_id = $5 AND id = $6 RETURNING id::text AS id, title, year, sections, is_public AS "isPublic", updated_at AS "updatedAt"',
        [title, year, JSON.stringify(sections), isPublic, user.sub, listMatch[1]]
      );
      return result.rowCount ? response(200, { list: result.rows[0] }) : response(404, { error: 'No se encontró la lista.' });
    }

    if (method === 'POST' && path === '/games') {
      const { id, name, background_image: image, released } = body;
      if (!id || !name) return response(400, { error: 'Faltan los datos del videojuego.' });
      const result = await database().query(
        `INSERT INTO game_entries (user_id, rawg_id, name, background_image, released)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (user_id, rawg_id) DO NOTHING
         RETURNING id, rawg_id AS "rawgId", name, background_image AS "backgroundImage", released, rating, status, platinum, replayed, recommended, notes`,
        [user.sub, String(id), name, image ?? null, released || null]
      );
      if (!result.rowCount) return response(409, { error: 'Ese juego ya está en tu biblioteca.' });
      return response(201, { game: result.rows[0] });
    }

    const gameMatch = path.match(/^\/games\/([^/]+)$/);
    if (gameMatch && method === 'PATCH') {
      const allowed = ['rating', 'status', 'platinum', 'replayed', 'recommended', 'notes'];
      const updates = Object.entries(body).filter(([key]) => allowed.includes(key));
      if (!updates.length) return response(400, { error: 'No hay cambios válidos.' });
      const values = updates.map(([, value]) => value);
      const assignments = updates.map(([key], index) => `${key} = $${index + 1}`).join(', ');
      values.push(user.sub, gameMatch[1]);
      const result = await database().query(
        `UPDATE game_entries SET ${assignments} WHERE user_id = $${values.length - 1} AND rawg_id = $${values.length} RETURNING id`,
        values
      );
      return result.rowCount ? response(200, { ok: true }) : response(404, { error: 'No se encontró el juego.' });
    }

    if (gameMatch && method === 'DELETE') {
      const result = await database().query('DELETE FROM game_entries WHERE user_id = $1 AND rawg_id = $2', [user.sub, gameMatch[1]]);
      return result.rowCount ? response(200, { ok: true }) : response(404, { error: 'No se encontró el juego.' });
    }

    return response(404, { error: 'Ruta no encontrada.' });
  } catch (error) {
    console.error(error);
    if (error.code === '23505') return response(409, { error: error.constraint === 'users_username_lower_idx' ? 'Ese nombre de usuario ya está en uso.' : 'Ya existe una cuenta con ese correo.' });
    if (error.message.startsWith('Falta configurar')) return response(503, { error: error.message });
    if (error.message.startsWith('RAWG respondió')) return response(502, { error: error.message });
    return response(500, { error: 'Ha ocurrido un error interno.' });
  }
}

export default async (request) => {
  const event = {
    rawUrl: request.url,
    httpMethod: request.method,
    headers: Object.fromEntries(request.headers),
    body: await request.text()
  };
  const result = await handleApiEvent(event);
  return new Response(result.body, { status: result.statusCode, headers: result.headers });
};
