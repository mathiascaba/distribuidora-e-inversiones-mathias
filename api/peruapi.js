const API_TOKEN = 'd4a47acc2f94af37bc4b40dff3753698fd1bb41e13cef88ea9d6d1b40529e94d';
const API_BASE = 'https://apiperu.dev/api';

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).json({});

  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method not allowed' });
  }

  try {
    const body = req.body || {};
    const endpoint = body.dni ? 'dni' : body.ruc ? 'ruc' : null;
    if (!endpoint) {
      return res.status(400).json({ success: false, error: 'Enviar dni o ruc' });
    }

    const payload = {};
    payload[endpoint] = body[endpoint];

    const response = await fetch(`${API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_TOKEN}`
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ success: false, error: 'API devolvió respuesta inválida', raw: text.slice(0, 200) });
    }
    return res.json(data);

  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
};
