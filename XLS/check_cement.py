import json
with open(r'C:\Users\Mathias\Desktop\ferreteria web\XLS\import_inventory.json', encoding='utf-8') as f:
    data = json.load(f)

cement_names = ['CEMENTO SOL BOLSA 42.5KG', 'CEMENTO ANDINO BOLSA 42.5KG', 'CEMENTO ANDINO ULTRA BOLSA 42.5KG', 'CEMENTO APU BOLSA 42.5KG']
for p in data:
    if p['name'].upper() in [c.upper() for c in cement_names]:
        print(f"{p['name']}: price={p['variations'][0]['price']}, stock={p['variations'][0]['stock']}, id={p['id']}")

# Also check what the old seed data had
print("\n--- Old seed data prices (for reference) ---")
for name in ['Cemento Sol Bolsa 42.5kg', 'Cemento Andino Bolsa 42.5kg', 'Cemento Andino Ultra Bolsa 42.5kg', 'Cemento Apu Bolsa 42.5kg']:
    print(f"{name}")
