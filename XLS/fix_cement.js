// PEGA ESTO EN LA CONSOLA DEL NAVEGADOR (F12) en distribuidora-e-inversiones-mathias.vercel.app
// y presiona Enter

const inv = JSON.parse(localStorage.getItem('fp_inventory') || '[]');

// 1. Eliminar los importados del Excel (CEMENTO SOL, CEMENTO ANDINO TIPO 1, CEMENTO ANDINO ULTRA, CEMENTO APU)
const eliminar = ['CEMENTO SOL', 'CEMENTO ANDINO   TIPO 1', 'CEMENTO ANDINO ULTRA', 'CEMENTO APU'];
let eliminados = 0;
const filtrado = inv.filter(p => {
  const nom = p.name.toUpperCase().replace(/\s+/g, ' ');
  if (eliminar.some(e => nom === e)) { eliminados++; return false; }
  return true;
});

// 2. Actualizar precios de los productos existentes
const precios = {
  'Cemento Sol Bolsa 42.5kg': { price: 29.80, stock: 18883 },
  'Cemento Andino Bolsa 42.5kg': { price: 30.95, stock: 1606 },
  'Cemento Andino Ultra Bolsa 42.5kg': { price: 31.35, stock: 1841 },
  'Cemento Apu Bolsa 42.5kg': { price: 27.10, stock: 2255 },
};

let actualizados = 0;
filtrado.forEach(p => {
  if (precios[p.name]) {
    if (p.variations && p.variations[0]) {
      p.variations[0].price = precios[p.name].price;
      p.variations[0].stock = precios[p.name].stock;
      actualizados++;
    }
  }
});

localStorage.setItem('fp_inventory', JSON.stringify(filtrado));
console.log(`✅ Eliminados: ${eliminados} productos importados`);
console.log(`✅ Actualizados: ${actualizados} productos con precios del Excel`);
console.log(`📦 Total inventario: ${filtrado.length} productos`);
console.log('\nVerifica en la página de inventario.');
