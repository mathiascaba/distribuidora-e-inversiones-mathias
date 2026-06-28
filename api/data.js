const API_KEY = 'AIzaSyA1jN2fbdSIASmTXCrTtU19gLBLjl2GzhA';
const FB_BASE = 'https://firestore.googleapis.com/v1/projects/distribuidora-e-inversiones/databases/(default)/documents';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).json({});

  try {
    const { key, value } = req.query || {};

    if (req.method === 'GET') {
      if (key) {
        const url = `${FB_BASE}/data/${encodeURIComponent(key)}?key=${API_KEY}`;
        const resp = await fetch(url);
        if (!resp.ok) return res.status(resp.status).json({});
        const data = await resp.json();
        return res.json({ value: data.fields?.value?.stringValue || '' });
      } else {
        const url = `${FB_BASE}/data?key=${API_KEY}`;
        const resp = await fetch(url);
        const data = await resp.json();
        const docs = {};
        if (data.documents) {
          data.documents.forEach(doc => {
            const k = decodeURIComponent(doc.name.split('/').pop());
            docs[k] = doc.fields?.value?.stringValue || '';
          });
        }
        return res.json(docs);
      }
    }

    if (req.method === 'POST') {
      if (!key || !value) {
        return res.status(400).json({ error: 'key y value requeridos' });
      }
      const url = `${FB_BASE}/data/${encodeURIComponent(key)}?key=${API_KEY}`;
      const body = JSON.stringify({
        fields: {
          value: { stringValue: value },
          updated: { integerValue: Date.now() }
        }
      });
      const resp = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body
      });
      if (!resp.ok) {
        const errText = await resp.text();
        return res.status(resp.status).json({ error: errText.slice(0, 200) });
      }
      return res.json({ ok: true });
    }

    return res.status(405).json({ error: 'Method not allowed' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
};
