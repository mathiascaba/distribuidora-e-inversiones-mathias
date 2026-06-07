// ── CARRITO ──────────────────────────────────────────────
function getCart() { return JSON.parse(localStorage.getItem('fp_cart') || '[]'); }
function saveCart(c) { localStorage.setItem('fp_cart', JSON.stringify(c)); updateCartBadge(); }

function addToCart(name, price, icon, cat, qty = 1) {
  const cart = getCart();
  const idx = cart.findIndex(i => i.name === name);
  if (idx >= 0) { cart[idx].qty += qty; } 
  else { cart.push({ name, price, icon, cat, qty }); }
  saveCart(cart);
  showToast(`✅ ${qty}x "${name}" agregado al carrito`);
}

function removeFromCart(idx) {
  const cart = getCart(); cart.splice(idx, 1); saveCart(cart); renderCart();
}

function updateQty(idx, delta) {
  const cart = getCart();
  cart[idx].qty = Math.max(1, cart[idx].qty + delta);
  saveCart(cart); renderCart();
}

function updateCartBadge() {
  const total = getCart().reduce((s, i) => s + i.qty, 0);
  document.querySelectorAll('.cart-badge').forEach(b => {
    b.textContent = total; b.style.display = total ? 'flex' : 'none';
  });
}

function renderCart() {
  const cart = getCart();
  const body = document.getElementById('cart-body');
  const total = document.getElementById('cart-total');
  if (!body) return;
  if (!cart.length) {
    body.innerHTML = '<div class="cart-empty"><span>🛒</span><p>Tu carrito está vacío</p></div>';
    if (total) total.textContent = 'S/ 0.00';
    return;
  }
  body.innerHTML = cart.map((item, i) => `
    <div class="cart-item">
      <div class="cart-item-icon">${productImages[item.name] ? `<img src="${productImages[item.name]}" alt="${item.name}" style="width:40px;height:40px;object-fit:contain;border-radius:4px">` : item.icon}</div>
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-cat">${item.cat}</div>
        <div class="cart-item-price">S/ ${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item-controls">
        <button onclick="updateQty(${i},-1)">−</button>
        <span>${item.qty}</span>
        <button onclick="updateQty(${i},1)">+</button>
      </div>
      <button class="cart-item-del" onclick="removeFromCart(${i})">🗑️</button>
    </div>
  `).join('');
  const sum = cart.reduce((s, i) => s + i.price * i.qty, 0);
  if (total) total.textContent = `S/ ${sum.toFixed(2)}`;
}

// ── USUARIO ───────────────────────────────────────────────
function getUser() { return JSON.parse(localStorage.getItem('fp_user') || 'null'); }
function saveUser(u) { localStorage.setItem('fp_user', JSON.stringify(u)); }
function logoutUser() { localStorage.removeItem('fp_user'); location.reload(); }

function updateUserUI() {
  const user = getUser();
  const btn = document.getElementById('user-btn');
  if (!btn) return;
  if (user) { btn.title = user.displayName; btn.innerHTML = `<span style="font-size:13px;font-weight:700;color:var(--amber);max-width:100px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;display:inline-block">${user.displayName}</span>`; }
}

// ── BUSQUEDA ──────────────────────────────────────────────
let allProducts = [];
const productImages = {
  'Cemento Sol Bolsa 42.5kg': 'bolsa-cemento-sol.png',
  'Cemento Andino Bolsa 42.5kg': 'bolsa-cemento-andino.png',
  'Cemento Andino Ultra Bolsa 42.5kg': 'bolsa-cemento-andino-ultra.png',
  'Cemento Apu Bolsa 42.5kg': 'bolsa-cemento-apu.png',
  'Arena Fina Bolsa 40kg': 'bolsa-arena-fina.png',
  'Arena Gruesa Bolsa 40kg': 'bolsa-arena-gruesa.png',
  'Ladrillo Pandereta': 'ladrillo-pandereta.png',
  'Ladrillo 18 Huecos': 'ladrillo-18-huecos.png',
  'Ladrillo King Kong 18 Huecos': 'ladrillo-kinkong-18-huecos.png',
  'Fierro Corrugado 1/2" x 9m': 'fierro-media.png',
  'Fierro 6mm x 9m': 'fierro-6mm.png',
  'Fierro 8mm x 9m': 'fierro-8mm.png',
  'Fierro 5/8" x 9m': 'fierro-cinco-octavos.png',
  'Fierro 3/8" x 9m': 'fierro-tres-octavos.png',
  'Fierro 1/4" x 9m': 'fierro-un-cuarto.png',
};

function renderSearchResults(q) {
  const res = document.getElementById('search-results');
  if (!res) return;
  if (!q || q.length < 2) { res.style.display = 'none'; return; }
  const matches = allProducts.filter(p =>
    p.name.toLowerCase().includes(q.toLowerCase()) ||
    p.cat.toLowerCase().includes(q.toLowerCase())
  ).slice(0, 6);
  if (!matches.length) {
    res.innerHTML = '<div class="sr-empty">No se encontraron productos</div>';
  } else {
    res.innerHTML = matches.map(p => `
      <div class="sr-item" onclick="addToCart('${p.name}',${p.price},'${p.icon}','${p.cat}')">
        <span class="sr-icon">${p.icon}</span>
        <div><div class="sr-name">${p.name}</div><div class="sr-price">S/ ${p.price.toFixed(2)}</div></div>
        <button class="sr-add">+ Agregar</button>
      </div>
    `).join('');
  }
  res.style.display = 'block';
}

// ── TOAST ─────────────────────────────────────────────────
function showToast(msg) {
  let t = document.getElementById('fp-toast');
  if (!t) { t = document.createElement('div'); t.id = 'fp-toast'; document.body.appendChild(t); }
  t.textContent = msg; t.className = 'fp-toast show';
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ── CHECKOUT ──────────────────────────────────────────────
function checkout() {
  const cart = getCart();
  if (!cart.length) { showToast('🛒 Tu carrito está vacío'); return; }
  closeCart();
  window.location.href = '/checkout.html';
}
function sendOrderToWhatsApp(data) {
  const { cart, name, phone, email, address, shipping, payment } = data;
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const shippingCost = shipping === 'delivery' ? 15 : 0;
  const grandTotal = total + shippingCost;
  let msg = '¡Hola! Quiero realizar el siguiente pedido:\n\n';
  msg += '═ PRODUCTOS ═\n';
  cart.forEach(item => { msg += `${item.icon} ${item.name} x${item.qty} = S/ ${(item.price * item.qty).toFixed(2)}\n`; });
  msg += `\nSubtotal: S/ ${total.toFixed(2)}\n`;
  msg += `Envío: ${shipping === 'delivery' ? 'A domicilio (+S/ 15.00)' : 'Recoger en tienda'}\n`;
  msg += `Total: S/ ${grandTotal.toFixed(2)}\n\n`;
  msg += '═ DATOS DEL CLIENTE ═\n';
  msg += `Nombre: ${name}\nTeléfono: ${phone}\nEmail: ${email}\nDirección: ${address || '—'}\n\n`;
  msg += `Método de pago: ${payment}`;
  const a = document.createElement('a');
  a.href = `https://wa.me/51980583077?text=${encodeURIComponent(msg)}`;
  a.target = '_blank'; a.click();
  showToast('✅ Pedido enviado por WhatsApp');
}

// ── VISITOR LOG ───────────────────────────────────────────
function getDeviceInfo() {
  const ua = navigator.userAgent;
  if (/android/i.test(ua)) return 'Android';
  if (/iPad|iPhone|iPod/.test(ua)) return 'iOS';
  if (/Windows/.test(ua)) return 'Windows';
  if (/Mac OS/.test(ua)) return 'Mac';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Otro';
}

function logVisit() {
  try {
    const visits = JSON.parse(localStorage.getItem('fp_visits') || '[]');
    const page = window.location.pathname.split('/').pop() || 'index.html';
    const device = getDeviceInfo();
    fetch('https://api.ipify.org?format=json').then(r => r.json()).then(d => {
      visits.push({ ip: d.ip, date: new Date().toISOString(), page, device });
      if (visits.length > 200) visits.splice(0, visits.length - 200);
      localStorage.setItem('fp_visits', JSON.stringify(visits));
    }).catch(() => {
      visits.push({ ip: 'localhost', date: new Date().toISOString(), page, device });
      localStorage.setItem('fp_visits', JSON.stringify(visits));
    });
  } catch(e) {}
}

// ── INIT ──────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  updateCartBadge();
  updateUserUI();
  logVisit();

  // Carrito panel toggle
  const cartBtn = document.getElementById('cart-btn');
  const cartPanel = document.getElementById('cart-panel');
  const cartOverlay = document.getElementById('cart-overlay');
  if (cartBtn) {
    cartBtn.onclick = () => {
      renderCart();
      cartPanel.classList.toggle('open');
      cartOverlay.classList.toggle('open');
      closeSearch(); closeUserPanel();
    };
  }
  if (cartOverlay) cartOverlay.onclick = () => { cartPanel.classList.remove('open'); cartOverlay.classList.remove('open'); };

  // Search toggle
  const searchBtn = document.getElementById('search-btn');
  const searchBar = document.getElementById('search-bar');
  const searchInput = document.getElementById('search-input');
  if (searchBtn) {
    searchBtn.onclick = () => {
      searchBar.classList.toggle('open');
      if (searchBar.classList.contains('open')) searchInput.focus();
      closeCart(); closeUserPanel();
    };
  }
  if (searchInput) {
    searchInput.addEventListener('input', e => renderSearchResults(e.target.value));
    document.addEventListener('click', e => {
      if (!searchBar.contains(e.target) && e.target !== searchBtn) closeSearch();
    });
  }

  // User panel toggle
  const userBtn = document.getElementById('user-btn');
  const userPanel = document.getElementById('user-panel');
  if (userBtn) {
    userBtn.onclick = (e) => {
      e.stopPropagation();
      userPanel.classList.toggle('open');
      closeCart(); closeSearch();
      renderUserPanel();
    };
    userPanel.onclick = (e) => {
      if (e.target === userPanel) closeUserPanel();
    };
  }

  // Quantity stepper
  document.addEventListener('click', function(e) {
    const dec = e.target.closest('.bp-qty-dec, .cat-prod-qty-dec, .prod-qty-dec');
    if (dec) {
      const val = dec.parentElement.querySelector('.bp-qty-val, .cat-prod-qty-val, .prod-qty-val');
      let q = parseInt(val.value || val.textContent) || 1;
      if (q > 1) { q--; if (val.tagName === 'INPUT') val.value = q; else val.textContent = q; }
      return;
    }
    const inc = e.target.closest('.bp-qty-inc, .cat-prod-qty-inc, .prod-qty-inc');
    if (inc) {
      const val = inc.parentElement.querySelector('.bp-qty-val, .cat-prod-qty-val, .prod-qty-val');
      let q = parseInt(val.value || val.textContent) || 1;
      q++; if (val.tagName === 'INPUT') val.value = q; else val.textContent = q;
      return;
    }
  });

  // Add-to-cart via event delegation
  document.addEventListener('click', function(e) {
    const btn = e.target.closest('.cat-prod-add, .btn-add-cart');
    if (!btn) return;
    e.stopPropagation();
    const qtyEl = btn.parentElement.querySelector('.cat-prod-qty-val, .bp-qty-val, .prod-qty-val');
    const qty = qtyEl ? parseInt(qtyEl.value || qtyEl.textContent) || 1 : 1;
    addToCart(btn.dataset.pname, parseFloat(btn.dataset.pprice), btn.dataset.picon || '📦', btn.dataset.pcat, qty);
  });

  // Custom cursor
  if (!document.getElementById('cursor')) {
    const c = document.createElement('div'); c.id = 'cursor';
    const r = document.createElement('div'); r.id = 'cursor-ring';
    document.body.prepend(c); document.body.prepend(r);
  }
  const cur = document.getElementById('cursor');
  const ring = document.getElementById('cursor-ring');
  if (cur && ring) {
    let mx = 0, my = 0, rx = 0, ry = 0;
    document.addEventListener('mousemove', e => {
      mx = e.clientX; my = e.clientY;
      cur.style.left = mx + 'px'; cur.style.top = my + 'px';
    });
    (function animRing() {
      rx += (mx - rx) * 0.12; ry += (my - ry) * 0.12;
      ring.style.left = rx + 'px'; ring.style.top = ry + 'px';
      requestAnimationFrame(animRing);
    })();
  }
});

function closeCart() {
  document.getElementById('cart-panel')?.classList.remove('open');
  document.getElementById('cart-overlay')?.classList.remove('open');
}
function closeSearch() {
  document.getElementById('search-bar')?.classList.remove('open');
  document.getElementById('search-results') && (document.getElementById('search-results').style.display = 'none');
}
function closeUserPanel() {
  document.getElementById('user-panel')?.classList.remove('open');
}

const USERS = {
  developer: { name: 'Developer', pass: '72586048', type: 'developer', icon: '💻' },
  conta: { name: 'Dueño', pass: '12345678', type: 'owner', icon: '👑' }
};

function renderUserPanel() {
  const panel = document.getElementById('user-panel');
  if (!panel) return;
  const user = getUser();
  if (user) {
    const u = USERS[user.username];
    panel.innerHTML = `
      <div class="up-card">
        <button class="up-card-close" onclick="closeUserPanel()">✕</button>
        <div class="up-header" style="border-bottom:none;margin-bottom:0">
          <div class="up-avatar">${u ? u.icon : '👤'}</div>
          <div><div class="up-name">${user.displayName}</div><div class="up-email">@${user.username}</div></div>
        </div>
        ${user.type === 'developer' ? '<a href="administrador.html" class="up-link" style="margin:8px 0;text-align:center;background:var(--mute2);border-radius:8px">⚙️ Panel de Administrador</a>' : ''}
        ${user.type === 'owner' ? '<a href="dashboard.html" class="up-link" style="margin:8px 0;text-align:center;background:var(--mute2);border-radius:8px">👑 Panel del Dueño</a>' : ''}
        <button class="up-logout" onclick="logoutUser()">Cerrar sesión</button>
      </div>
    `;
  } else {
    panel.innerHTML = `
      <div class="up-card">
        <button class="up-card-close" onclick="closeUserPanel()">✕</button>
        <div class="up-title">Acceso Privado</div>
        <div id="tab-login" class="up-form">
          <input type="text" id="login-user" placeholder="Usuario" class="up-input"/>
          <input type="password" id="login-pass" placeholder="Contraseña" class="up-input" onkeydown="if(event.key==='Enter') doLogin()"/>
          <button class="up-btn-submit" onclick="doLogin()">Ingresar</button>
        </div>
      </div>
    `;
  }
}

function doLogin() {
  const username = document.getElementById('login-user').value.trim().toLowerCase();
  const pass = document.getElementById('login-pass').value;
  if (!username || !pass) { showToast('⚠️ Ingresa usuario y contraseña'); return; }
  const u = USERS[username];
  if (!u || u.pass !== pass) { showToast('❌ Usuario o contraseña incorrectos'); return; }
  saveUser({ username: username, displayName: u.name, type: u.type });
  showToast(`✅ Bienvenido, ${u.name}`);
  document.getElementById('user-panel').classList.remove('open');
  updateUserUI();
}

// ═══════════════════════════════════════════════════════════════
// ── SISTEMA DB (Módulos de gestión) ──
// ═══════════════════════════════════════════════════════════════
function dbId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,6); }
function dbDate(d) { return (d||new Date()).toISOString().slice(0,16).replace('T',' '); }
function dbToday() { return new Date().toISOString().slice(0,10); }
function dbGet(k) { return JSON.parse(localStorage.getItem(k) || '[]'); }
function dbSet(k, v) { localStorage.setItem(k, JSON.stringify(v)); }
function dbGetObj(k) { return JSON.parse(localStorage.getItem(k) || 'null'); }
function dbSetObj(k, v) { localStorage.setItem(k, JSON.stringify(v)); }

// ── CONFIG ──
function cfgGet() {
  let c = dbGetObj('fp_cfg');
  if (!c) {
    c = { empresa: 'Distribuidora e Inversiones Mathias', ruc: '', direccion: 'Lima, Perú', telefono: '+51 980 583 077', email: '', igv: 18, moneda: 'S/', logo: '🔧' };
    dbSetObj('fp_cfg', c);
  }
  return c;
}
function cfgSave(c) { dbSetObj('fp_cfg', c); }

// ── CLIENTES ──
function cliGet() { return dbGet('fp_cli'); }
function cliSave(d) { dbSet('fp_cli', d); }
function cliAdd(o) { const d=cliGet(); o={id:dbId(), fecha:dbDate(), ...o}; d.push(o); cliSave(d); return o; }
function cliUpd(id, o) { const d=cliGet(); const i=d.findIndex(x=>x.id===id); if(i>=0){d[i]={...d[i],...o}; cliSave(d);} }
function cliDel(id) { cliSave(cliGet().filter(x=>x.id!==id)); }
function cliGetById(id) { return cliGet().find(x=>x.id===id); }

// ── PROVEEDORES ──
function provGet() { return dbGet('fp_prov'); }
function provSave(d) { dbSet('fp_prov', d); }
function provAdd(o) { const d=provGet(); o={id:dbId(), fecha:dbDate(), ...o}; d.push(o); provSave(d); return o; }
function provUpd(id, o) { const d=provGet(); const i=d.findIndex(x=>x.id===id); if(i>=0){d[i]={...d[i],...o}; provSave(d);} }
function provDel(id) { provSave(provGet().filter(x=>x.id!==id)); }

// ── MARCAS ──
function marcasGet() { return dbGet('fp_marcas'); }
function marcasSave(d) { dbSet('fp_marcas', d); }
function marcasAdd(n) { if(!n)return; const d=marcasGet(); if(d.find(x=>x.nombre.toLowerCase()===n.toLowerCase()))return; const o={id:dbId(),nombre:n}; d.push(o); marcasSave(d); return o; }
function marcasDel(id) { marcasSave(marcasGet().filter(x=>x.id!==id)); }

// ── CATEGORÍAS ──
function catsGet() { return dbGet('fp_cats'); }
function catsSave(d) { dbSet('fp_cats', d); }
function catsAdd(n) { if(!n)return; const d=catsGet(); if(d.find(x=>x.nombre.toLowerCase()===n.toLowerCase()))return; const o={id:dbId(),nombre:n}; d.push(o); catsSave(d); return o; }
function catsDel(id) { catsSave(catsGet().filter(x=>x.id!==id)); }

// ── COMPRAS ──
function compGet() { return dbGet('fp_compras'); }
function compSave(d) { dbSet('fp_compras', d); }
function compAdd(o) { const d=compGet(); o={id:dbId(), fecha:dbDate(), estado:'pendiente', ...o}; d.push(o); compSave(d); return o; }
function compUpd(id, o) { const d=compGet(); const i=d.findIndex(x=>x.id===id); if(i>=0){d[i]={...d[i],...o}; compSave(d);} }
function compDel(id) { compSave(compGet().filter(x=>x.id!==id)); }

// ── VENTAS ──
function ventasGet() { return dbGet('fp_ventas'); }
function ventasSave(d) { dbSet('fp_ventas', d); }
function ventasAdd(o) { const d=ventasGet(); o={id:dbId(), fecha:dbDate(), tipo:'boleta', estado:'completada', ...o}; d.push(o); ventasSave(d); return o; }

// ── CRÉDITOS ──
function creditosGet() { return dbGet('fp_creditos'); }
function creditosSave(d) { dbSet('fp_creditos', d); }
function creditosAdd(o) { const d=creditosGet(); o={id:dbId(), fecha:dbDate(), estado:'pendiente', pagos:[], ...o}; d.push(o); creditosSave(d); return o; }
function creditosPagar(id, monto, metodo) {
  const d=creditosGet(); const i=d.findIndex(x=>x.id===id); if(i<0)return;
  d[i].pagos.push({id:dbId(), fecha:dbDate(), monto, metodo});
  const totalPagado = d[i].pagos.reduce((s,p)=>s+p.monto,0);
  if (totalPagado >= d[i].total) d[i].estado = 'pagado';
  creditosSave(d);
}

// ── SESIONES DE CAJA ──
function cajasGet() { return dbGet('fp_cajas'); }
function cajasSave(d) { dbSet('fp_cajas', d); }
function cajasAbrir(o) { const d=cajasGet(); o={id:dbId(), apertura:dbDate(), cierre:null, estado:'abierta', movimientos:[], ...o}; d.push(o); cajasSave(d); return o; }
function cajasCerrar(id) { const d=cajasGet(); const i=d.findIndex(x=>x.id===id); if(i>=0){d[i].cierre=dbDate(); d[i].estado='cerrada'; cajasSave(d);} }
function cajasMovimiento(id, o) {
  const d=cajasGet(); const i=d.findIndex(x=>x.id===id); if(i<0)return;
  o={id:dbId(), fecha:dbDate(), ...o}; d[i].movimientos.push(o);
  if (o.tipo==='ingreso') d[i].saldo = (d[i].saldo||0) + o.monto;
  else d[i].saldo = (d[i].saldo||0) - o.monto;
  cajasSave(d);
}

// ── CAJA PRINCIPAL ──
function cajaPriGet() { let c=dbGetObj('fp_caja_pri'); if(!c){c={saldo:0, movimientos:[]}; dbSetObj('fp_caja_pri',c);} return c; }
function cajaPriSave(c) { dbSetObj('fp_caja_pri', c); }
function cajaPriMov(o) { const c=cajaPriGet(); o={id:dbId(), fecha:dbDate(), ...o}; c.movimientos.push(o); if(o.tipo==='ingreso') c.saldo+=o.monto; else c.saldo-=o.monto; cajaPriSave(c); }

// ── GASTOS ──
function gastosGet() { return dbGet('fp_gastos'); }
function gastosSave(d) { dbSet('fp_gastos', d); }
function gastosAdd(o) { const d=gastosGet(); o={id:dbId(), fecha:dbDate(), ...o}; d.push(o); gastosSave(d); return o; }
function gastosDel(id) { gastosSave(gastosGet().filter(x=>x.id!==id)); }

// ── NÚMEROS CORRELATIVOS ──
function corrGet(tipo) {
  let c = dbGetObj('fp_correlativos') || {};
  if (!c[tipo]) c[tipo] = 1;
  return c;
}
function corrNext(tipo) {
  let c = corrGet(tipo);
  const n = c[tipo];
  c[tipo] = n + 1;
  dbSetObj('fp_correlativos', c);
  return String(n).padStart(4,'0');
}

// ── INVENTARIO ──
const INV_KEY = 'fp_inventory';
const CAT_NAMES = { electrico:'⚡ Eléctrico', herramienta:'🔨 Herramienta', gasfiteria:'🚿 Gasfitería', quimicos:'🧪 Químicos', construccion:'🧱 Construcción', otros:'🔩 Otros' };

function getInv() {
  let inv = JSON.parse(localStorage.getItem(INV_KEY) || '[]');
  if (inv.length) return inv;
  const list = [
    { name:'Cable THW 2.5mm Rollo 100m', icon:'🔌', cat:'electrico' },
    { name:'Foco LED 12W Luz Fría Pack x10', icon:'💡', cat:'electrico' },
    { name:'Interruptor Doble Ticino', icon:'🔆', cat:'electrico' },
    { name:'Tablero Eléctrico 12 Polos', icon:'⚡', cat:'electrico' },
    { name:'Taladro Percutor 800W Profesional', icon:'🔧', cat:'herramienta' },
    { name:'Set Destornilladores 12 piezas', icon:'🔩', cat:'herramienta' },
    { name:'Amoladora Angular 4.5" 850W', icon:'⚙️', cat:'herramienta' },
    { name:'Sierra Circular 7.25" 1200W', icon:'🪚', cat:'herramienta' },
    { name:'Tubería PVC 4" x 3m Desagüe', icon:'🚿', cat:'gasfiteria' },
    { name:'Llave de Paso 1/2" Bronce', icon:'🔑', cat:'gasfiteria' },
    { name:'Codo PVC 90° 2" Presión', icon:'🔄', cat:'gasfiteria' },
    { name:'Termocalefón 20 Litros Gas', icon:'🌡️', cat:'gasfiteria' },
    { name:'Pintura Látex Interior 4 Galones', icon:'🎨', cat:'quimicos' },
    { name:'Thinner Acrílico 1 Galón', icon:'🪣', cat:'quimicos' },
    { name:'Sellador Acrílico 280ml', icon:'💊', cat:'quimicos' },
    { name:'Impermeabilizante 4 Litros', icon:'🧴', cat:'quimicos' },
    { name:'Cemento Sol Bolsa 42.5kg', icon:'🧱', cat:'construccion' },
    { name:'Cemento Andino Bolsa 42.5kg', icon:'🧱', cat:'construccion' },
    { name:'Cemento Andino Ultra Bolsa 42.5kg', icon:'🧱', cat:'construccion' },
    { name:'Cemento Apu Bolsa 42.5kg', icon:'🧱', cat:'construccion' },
    { name:'Fierro Corrugado 1/2" x 9m', icon:'🏗️', cat:'construccion' },
    { name:'Fierro 6mm x 9m', icon:'🏗️', cat:'construccion' },
    { name:'Fierro 8mm x 9m', icon:'🏗️', cat:'construccion' },
    { name:'Fierro 5/8" x 9m', icon:'🏗️', cat:'construccion' },
    { name:'Fierro 3/8" x 9m', icon:'🏗️', cat:'construccion' },
    { name:'Fierro 1/4" x 9m', icon:'🏗️', cat:'construccion' },
    { name:'Ladrillo 18 Huecos', icon:'🧱', cat:'construccion' },
    { name:'Ladrillo King Kong 18 Huecos', icon:'🧱', cat:'construccion' },
    { name:'Ladrillo Pandereta', icon:'🧱', cat:'construccion' },
    { name:'Arena Fina Bolsa 40kg', icon:'⛱️', cat:'construccion' },
    { name:'Arena Gruesa Bolsa 40kg', icon:'⛱️', cat:'construccion' },
    { name:'Cinta Aislante Pack x5', icon:'🎗️', cat:'otros' },
    { name:'Mascarilla N95 Pack x10', icon:'😷', cat:'otros' },
    { name:'Guantes de Seguridad Par', icon:'🧤', cat:'otros' },
    { name:'Casco de Seguridad', icon:'⛑️', cat:'otros' },
  ];
  inv = list.map(p => ({
    id: p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-+$/,''),
    name: p.name, icon: p.icon, cat: p.cat,
    variations: [{ id:'v1', name:'Unidad', price: Math.floor(Math.random()*50)+5, stock: Math.floor(Math.random()*100)+10 }]
  }));
  saveInv(inv);
  return inv;
}
function saveInv(d) { localStorage.setItem(INV_KEY, JSON.stringify(d)); }

// ── CATÁLOGO DINÁMICO DESDE INVENTARIO ──
function refreshCatalog() {
  const inv = getInv();
  allProducts.length = 0;
  allProducts.push(...inv.map(p => ({
    name: p.name,
    price: p.variations[0]?.price || 0,
    icon: p.icon,
    cat: p.cat,
    badge: '',
    old: 0
  })));
  if (window.CAT !== undefined) {
    window.currentProducts = window.CAT ? allProducts.filter(p => p.cat === window.CAT) : [...allProducts];
    if (typeof window.renderGrid === 'function') window.renderGrid(window.currentProducts);
  }
}
refreshCatalog();

// ── SINCRONIZACIÓN MULTI-DISPOSITIVO ──
const _origSet = Storage.prototype.setItem;
const _fbQueue = [];
let _fbReady = false;

Storage.prototype.setItem = function(key, value) {
  _origSet.call(this, key, value);
  if (key.startsWith('fp_')) {
    if (_fbReady) _fbWrite(key, value);
    else _fbQueue.push({ key, value });
  }
};

function _fbWrite(key, value) {
  const url = `/.netlify/functions/data?key=${encodeURIComponent(key)}&value=${encodeURIComponent(value)}`;
  fetch(url, { method: 'POST' }).catch(() => {});
}

setTimeout(() => {
  _fbReady = true;
  _fbQueue.forEach(w => _fbWrite(w.key, w.value));
  _fbQueue.length = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i);
    if (k.startsWith('fp_')) _fbWrite(k, localStorage.getItem(k));
  }
  fetch('/.netlify/functions/data')
    .then(r => r.json())
    .then(docs => {
      let changed = false;
      Object.entries(docs).forEach(([k, v]) => {
        if (v) { _origSet.call(localStorage, k, v); changed = true; }
      });
      if (changed) {
        refreshCatalog();
        setTimeout(() => {
          ['renderCart','renderVentas','renderInv','renderCompras','renderCreditos','renderCajas','loadDashboard','loadCompanyCfg']
            .forEach(fn => { if (typeof window[fn] === 'function') window[fn](); });
        }, 100);
      }
    })
    .catch(() => {});
}, 1000);
