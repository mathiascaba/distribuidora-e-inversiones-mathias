import json
with open(r'C:\Users\Mathias\Desktop\ferreteria web\XLS\import_inventory.json', encoding='utf-8') as f:
    data = json.load(f)

# Find all products with CEMENTO in name
for p in data:
    if 'CEMENTO' in p['name'].upper():
        print(f"name='{p['name']}', price={p['variations'][0]['price']}, stock={p['variations'][0]['stock']}, cat={p['cat']}")
