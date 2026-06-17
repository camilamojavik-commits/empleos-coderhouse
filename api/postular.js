// POST /api/postular
// Proxy: recibe la postulación del portal, le agrega el token secreto
// (que vive solo en el servidor) y la reenvía al Apps Script.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  try {
    const body = typeof req.body === 'string'
      ? JSON.parse(req.body || '{}')
      : (req.body || {});

    // Validación mínima del lado servidor.
    if (!body.nombre || !body.email) {
      res.status(400).json({ ok: false, error: 'Faltan datos obligatorios (nombre/email).' });
      return;
    }

    const r = await fetch(process.env.SCRIPT_URL, {
      method: 'POST',
      // text/plain evita el preflight CORS en el hop server→Apps Script.
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ ...body, token: process.env.SCRIPT_TOKEN }),
      redirect: 'follow'
    });

    const out = await r.json().catch(() => ({ ok: false, error: 'Respuesta inválida del tracker.' }));
    res.status(r.ok && out.ok !== false ? 200 : 502).json(out);
  } catch (err) {
    res.status(502).json({ ok: false, error: 'No se pudo registrar la postulación.' });
  }
}
