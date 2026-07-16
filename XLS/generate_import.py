import openpyxl, json

wb = openpyxl.load_workbook(r'C:\Users\Mathias\Desktop\ferreteria web\XLS\KARDEX stock 15julio.xlsx', data_only=True)
ws = wb.active

products = []
for row in ws.iter_rows(min_row=2, values_only=True):
    linea = str(row[10]).strip() if row[10] else ''
    if linea == 'MERCADERÍA':
        cod = str(row[1]).strip() if row[1] else ''
        desc = str(row[2]).strip() if row[2] else ''
        stock_raw = row[5]
        costo_raw = row[7] or 0
        if not desc:
            continue
        try:
            stock = max(0, int(float(str(stock_raw).replace(',','.'))) if stock_raw is not None and str(stock_raw).strip() else 0)
        except:
            stock = 0
        try:
            price = float(str(costo_raw).replace(',','.')) if costo_raw and str(costo_raw).strip() else 0
        except:
            price = 0
        products.append((cod, desc, price, stock))

def classify(desc):
    d = desc.upper()
    # --- ELECTRICO ---
    if any(kw in d for kw in [
        'CABLE', 'FOCO', 'FOCOS', 'INTERRUPTOR', 'LLAVE TERM', 'LLAVE TERMICA',
        'TOMACORRIENTE', 'ELECTRIC', 'CANALETA', 'CINTA AISL', 'LED',
        'PORTALAMP', 'SOCKET', 'ENCHUFE', 'EMPALME',
        'BOQUILLA', 'BASE VOLANTE', 'PLACA', 'CURVA ELECTR',
        'CONECTOR ELECTR', 'CTO', 'TABLERO DE METAL',
        'BOMBILLA', 'TICINO', 'ARRANCADOR',
        'FOTOCELDA', 'TIMBRE', 'CITO', 'CONTROL REMOTO',
        'TRANSFORMADOR', 'REFLECTOR', 'SPOT', 'DICROICA',
        'TUBO LED', 'BALASTRO', 'DRIVER',
        'CAJA PASE', 'CAJA MODULAR', 'CAJITA PARA TERNICA',
        'CONMUTACION', 'LUZ', 'CINTILLO', 'CRUZ RG6',
    ]):
        return 'electrico'
    # --- HERRAMIENTA ---
    if any(kw in d for kw in [
        'TALADRO', 'AMOLADORA', 'SIERRA', 'MARTILLO', 'ARCO DE SIERRA',
        'CUTTER', 'LLAVE MIXTA', 'LLAVE FRANCES', 'LLAVE CORONA', 'DADO',
        'ALICATE', 'DESTORNILLADOR', 'LIMA', 'WINCHA', 'NIVEL',
        'CINCEL', 'BROCA', 'DISCO', 'ESCOBILLA', 'CEPILLO',
        'PRENSA', 'TORQUIMETRO', 'STANLEY', 'TRAMONTINA', 'PRETUL',
        'URREA', 'TOOL', 'HOJA DE SIERRA', 'PUNTA', 'LLAVE STILSON',
        'LLAVE PICO', 'DESARMADOR', 'CARRETILLA', 'COMBA',
        'CASCOS', 'GUANTES', 'ARNES', 'MASCARILLA',
        'ESCOBA', 'TRAPEADOR', 'RECOGEDOR', 'BALDE', 'BADILEJO',
        'BROCHA', 'RODILLO', 'ESPATULA', 'LLANA', 'PICOTA',
        'BARBIQUEJO', 'LENTE', 'TAPA OIDO', 'TAPA OIDOS',
        'CASCO DE SEGURIDAD', 'CHALECO',
        'CAUTIL', 'SOLDAR', 'SOLDADOR', 'ESTAÑO',
        'PISTOLA', 'TANQUE DE', 'BRUÑA', 'MACHO',
        'CORTADOR DE VIDRIO', 'CUCHILLA CUTER',
        'PLATO CON LIJAS', 'ESCUADRA', 'LIJA', 'LIJAS',
    ]):
        return 'herramienta'
    # --- GASFITERIA ---
    if any(kw in d for kw in [
        'PVC', 'TUBO', 'TUBER', 'ABRAZADERA', 'LLAVE DE PASO',
        'REDUCCION', 'DESAGUE', 'GRIFERIA', 'GRIFO',
        'CAÑO', 'VALVULA', 'NIPLE', 'ADAPTADOR',
        'TEE', 'YEE', 'TRAMPA', 'FLOTADOR', 'WATER',
        'INODORO', 'LAVATORIO', 'LAVADERO', 'DUCHA', 'REGADERA',
        'SIFON', 'EMPAQUE', 'JUNTA', 'TEFLON',
        'MATUSITA', 'PAVCO', 'GEOPLAST', 'CIMBAL',
        'TAPON', 'CODO', 'NICOL', 'ACCESORIO DE WATER',
        'SEDAPAL', 'TANQUE', 'SAPITO', 'FLAPER', 'SANITARIO',
        'UNION', 'BUSING', 'CAÑERIA', 'CHECK',
        'DESATORADOR', 'DIAGRAGMA', 'AGUA',
        'COLA',  # pipe cola/bell
    ]):
        # 'COLA' is risky (cola sintetica is glue/quimicos)
        # but placed after quimicos check, so if 'COLA SINTETICA' it's already caught
        return 'gasfiteria'
    # --- QUIMICOS ---
    if any(kw in d for kw in [
        'PINTURA', 'THINNER', 'LATEX', 'ESMALTE', 'BARNIZ',
        'DISOLVENTE', 'IMPERMEABILIZ', 'MASILLA', 'YESO', 'ESTUCO',
        'ADHESIVO', 'PEGA PEGA', 'LACA', 'ACEITE', 'BATERIA',
        'PILAS', 'EXTINTOR', 'QUIMICO',
        'ALCOHOL', 'ACIDO', 'AMBIENTADOR', 'ACONDICIONADOR DE METALES',
        'LUBRICANTE', 'SILICONA', 'PEGAMENTO',
        'AZUFRE', 'BAYGON', 'BENCINA', 'INSECTICIDA',
        'LEJIA', 'DESINFECTANTE', 'CERA', 'LIMPIA',
        'ZINCROMATO', 'AROMA', 'FORMADOR',
        'CAMPEON', 'PERICOTE', 'RATICIDA', 'CEBO',
        'ABONO', 'FERTILIZANTE', 'MATABACHA', 'VENENO',
        'CHEMATOP', 'SIKAFLEX', 'THINER',
        'SAPOLIO', 'CUCARACHA',
    ]):
        return 'quimicos'
    # --- CONSTRUCCION ---
    if any(kw in d for kw in [
        'CEMENTO', 'LADRILLO', 'FIERRO', 'ARENA', 'PIEDRA', 'CAL',
        'MORTERO', 'CONCRETO', 'BLOQUE', 'MALLA', 'ALAMBRE', 'CLAVO',
        'PERNO', 'VIGA', 'DRYWALL', 'ARCILLA', 'GRAVA',
        'BOLSA', 'PREMIX',
        'ANGULO', 'AFRICAN', 'TECNOPOR',
        'BISAGRA', 'ALDAVA', 'ALCAYATA', 'ARMELLA',
        'BRACKETA', 'BRAZO', 'CERRADURA', 'PICAPORTE',
        'PASADOR', 'ALDABA', 'GRAMPA', 'GRAPA',
        'CLAVOS', 'PERNOS', 'TUERCA', 'ARANDELA',
        'REMACHE', 'CERROJO', 'CHAPA', 'CADENA', 'CANDADO',
        'PESTILLO', 'MANIJA', 'CORTINERO', 'CRUCETA',
        'CHINCHE', 'CHUPON', 'CINTA MAKISTAPE',
    ]):
        return 'construccion'
    # --- ACABADOS ---
    if any(kw in d for kw in [
        'BARNIZ', 'LACA', 'ACABADO',
        'CERAMICO', 'MAYOLICA', 'PORCELANATO',
        'MELAMINE', 'FORMICA', 'LAMINA', 'PAPEL TAPIZ',
        'DECORATIVO', 'PASTA',
    ]):
        return 'acabados'
    return 'otros'

# Classify
cats = {}
inventory = []
for cod, desc, price, stock in products:
    c = classify(desc)
    cats[c] = cats.get(c, 0) + 1
    
    inv_id = ''
    for ch in desc.lower():
        if ch.isalnum():
            inv_id += ch
        else:
            if inv_id and inv_id[-1] != '-':
                inv_id += '-'
    inv_id = inv_id.strip('-')
    
    item = {
        'id': inv_id,
        'name': desc,
        'icon': '📦',
        'cat': c,
        'variations': [{
            'id': 'v1',
            'name': 'Unidad',
            'price': price,
            'stock': stock
        }]
    }
    inventory.append(item)

# Print summary
print('Classification results:')
tot = 0
for c in ['electrico','herramienta','gasfiteria','quimicos','construccion','acabados','otros']:
    n = cats.get(c, 0)
    tot += n
    print(f'  {c}: {n}')
print(f'  total: {tot}')

# Save to JSON
with open(r'C:\Users\Mathias\Desktop\ferreteria web\XLS\import_inventory.json', 'w', encoding='utf-8') as f:
    json.dump(inventory, f, ensure_ascii=False, indent=2)

print(f'\nSaved {len(inventory)} products to import_inventory.json')
