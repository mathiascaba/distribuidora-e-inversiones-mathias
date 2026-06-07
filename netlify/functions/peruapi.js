const API_TOKEN = 'd4a47acc2f94af37bc4b40dff3753698fd1bb41e13cef88ea9d6d1b40529e94d';
const API_BASE = 'https://apiperu.dev/api';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '{}' };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ success: false, error: 'Method not allowed' }) };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const endpoint = body.dni ? 'dni' : body.ruc ? 'ruc' : null;
    if (!endpoint) {
      return { statusCode: 400, headers, body: JSON.stringify({ success: false, error: 'Enviar dni o ruc' }) };
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
      return { statusCode: 502, headers, body: JSON.stringify({ success: false, error: 'API devolvió respuesta inválida', raw: text.slice(0,200) }) };
    }
    return { statusCode: 200, headers, body: JSON.stringify(data) };

  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ success: false, error: e.message }) };
  }
};
