// GET /api/busquedas
// Proxy: pide las búsquedas abiertas al Apps Script y las devuelve al portal.
// Corre en el servidor de Vercel → no hay problema de CORS y la URL del
// script nunca se expone al navegador.

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.status(405).json({ ok: false, error: 'Method not allowed' });
    return;
  }
  try {
    const url = `${process.env.SCRIPT_URL}?accion=busquedas`;
    const r = await fetch(url, { redirect: 'follow' });
    const data = await r.json();
    // Cache liviano en el edge de Vercel (60s, revalida en background).
    res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
    res.status(200).json(data);
  } catch (err) {
    res.status(502).json({ ok: false, error: 'No se pudieron obtener las búsquedas.' });
  }
}
