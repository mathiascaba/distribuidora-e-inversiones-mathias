const API_KEY = 'AIzaSyA1jN2fbdSIASmTXCrTtU19gLBLjl2GzhA';
const FB_BASE = 'https://firestore.googleapis.com/v1/projects/distribuidora-e-inversiones/databases/(default)/documents';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '{}' };
  }

  try {
    const { key, value } = event.queryStringParameters || {};

    if (event.httpMethod === 'GET') {
      if (key) {
        // Leer un documento específico
        const url = `${FB_BASE}/data/${encodeURIComponent(key)}?key=${API_KEY}`;
        const resp = await fetch(url);
        if (!resp.ok) return { statusCode: resp.status, headers, body: '{}' };
        const data = await resp.json();
        return { statusCode: 200, headers, body: JSON.stringify({ value: data.fields?.value?.stringValue || '' }) };
      } else {
        // Leer toda la colección
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
        return { statusCode: 200, headers, body: JSON.stringify(docs) };
      }
    }

    if (event.httpMethod === 'POST') {
      if (!key || !value) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'key y value requeridos' }) };
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
        return { statusCode: resp.status, headers, body: JSON.stringify({ error: errText.slice(0,200) }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (e) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: e.message }) };
  }
};
