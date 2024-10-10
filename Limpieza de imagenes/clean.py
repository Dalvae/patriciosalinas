import cloudinary
import cloudinary.api
import json
from datetime import datetime
import os

# Configuración de Cloudinary
cloudinary.config( 
  cloud_name = "xxxxxx",
  api_key = "xxxxxxx",
  api_secret = "xxxx"
)

current_dir = os.path.dirname(os.path.abspath(__file__))
wp_json_path = os.path.join(current_dir, 'images.json')

# Cargar el JSON de WordPress con los public_id
with open(wp_json_path, 'r') as file:
    wp_data = json.load(file)

# Obtener los public_id de las imágenes en WordPress
wp_image_ids = [item['public_id'] for item in wp_data if 'public_id' in item]
print(f"Número de imágenes en WordPress: {len(wp_image_ids)}")
print("Ejemplos de public_id en WordPress:", wp_image_ids[:5])

# Obtener los recursos de Cloudinary
result = cloudinary.api.resources(
  type = "upload",
  prefix = "patriciosalinas/",
  max_results = 500
)

cloudinary_resources = result.get('resources', [])
cloudinary_image_ids = [res['public_id'] for res in cloudinary_resources]
print(f"Número de recursos en Cloudinary: {len(cloudinary_image_ids)}")
print("Ejemplos de public_id en Cloudinary:", cloudinary_image_ids[:5])

# Separar los recursos en uso y no en uso
resources_in_use = []
resources_not_in_use = []

# Crear una lista para almacenar los IDs que están en WordPress pero no en Cloudinary
missing_in_cloudinary = []

# Comparar los public_id de WordPress con Cloudinary
for wp_image_id in wp_image_ids:
    if wp_image_id in cloudinary_image_ids:
        resources_in_use.append(wp_image_id)
    else:
        missing_in_cloudinary.append(wp_image_id)

# Obtener recursos no en uso (en Cloudinary pero no en WordPress)
resources_not_in_use = [res for res in cloudinary_image_ids if res not in wp_image_ids]

# Imprimir los resultados
print(f"Recursos en uso: {len(resources_in_use)}")
print(f"Recursos no en uso: {len(resources_not_in_use)}")
print(f"Imágenes de WordPress no encontradas en Cloudinary: {len(missing_in_cloudinary)}")

# Mostrar las primeras imágenes que no se encuentran en Cloudinary para investigar
if missing_in_cloudinary:
    print("Ejemplos de imágenes de WordPress que no se encontraron en Cloudinary:")
    print(missing_in_cloudinary[:10])

# Guardar los resultados en archivos JSON
timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

in_use_path = os.path.join(current_dir, f'resources_in_use_{timestamp}.json')
to_delete_path = os.path.join(current_dir, f'resources_to_delete_{timestamp}.json')
missing_in_cloudinary_path = os.path.join(current_dir, f'missing_in_cloudinary_{timestamp}.json')

with open(in_use_path, 'w') as f:
    json.dump(resources_in_use, f, indent=2)

with open(to_delete_path, 'w') as f:
    json.dump(resources_not_in_use, f, indent=2)

# Guardar las imágenes que faltan en Cloudinary
with open(missing_in_cloudinary_path, 'w') as f:
    json.dump(missing_in_cloudinary, f, indent=2)

print(f"Se han creado los archivos JSON:")
print(f"Resources in use: {in_use_path}")
print(f"Resources to delete: {to_delete_path}")
print(f"Imágenes de WordPress no encontradas en Cloudinary: {missing_in_cloudinary_path}")

# Proceder a borrar los recursos no en uso
if resources_not_in_use:
    print(f"Eliminando {len(resources_not_in_use)} recursos no en uso...")

    # Cloudinary permite eliminar hasta 1000 recursos a la vez. Se puede hacer en bloques.
    batch_size = 100  # Ajustar si es necesario
    for i in range(0, len(resources_not_in_use), batch_size):
        batch = resources_not_in_use[i:i + batch_size]
        response = cloudinary.api.delete_resources(batch)
        print(f"Eliminados recursos: {batch}")
        print("Respuesta de Cloudinary:", response)

print("Proceso de eliminación completado.")
