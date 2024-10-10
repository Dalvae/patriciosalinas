import requests
import json
import re
import os

# Definimos la función para extraer el nombre de la imagen
def extract_image_name(url):
    # Extrae todo el nombre de la imagen incluyendo el prefijo 'patriciosalinas/'
    match = re.search(r'(patriciosalinas/[^/]+)', url)
    if match:
        return match.group(1)
    return None

# Función para obtener los datos desde el endpoint de GraphQL con manejo de paginación
def fetch_images_from_wordpress():
    url = "https://www.apuntesdispersos.com/graphql"
    query_template = """
    query GetAllMediaItems($after: String) {
      mediaItems(first: 100, after: $after) {
        nodes {
          sourceUrl
        }
        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
    """
    
    images = []
    has_next_page = True
    after_cursor = None

    while has_next_page:
        query = {
            "query": query_template,
            "variables": {"after": after_cursor}
        }
        
        response = requests.post(url, json=query)
        
        if response.status_code == 200:
            data = response.json()['data']['mediaItems']
            images.extend(data['nodes'])
            has_next_page = data['pageInfo']['hasNextPage']
            after_cursor = data['pageInfo']['endCursor']
        else:
            print(f"Error al obtener los datos: {response.status_code}")
            break

    return images

# Función principal para extraer los IDs y guardarlos en un archivo JSON
def save_images_to_json():
    images_data = fetch_images_from_wordpress()
    parsed_images = []

    for image in images_data:
        source_url = image.get("sourceUrl", "")
        public_id = extract_image_name(source_url)
        
        if public_id:
            parsed_images.append({"public_id": public_id})

    # Guardar los resultados en un archivo JSON en la carpeta actual
    output_path = os.path.join(os.getcwd(), "images.json")
    with open(output_path, "w") as json_file:
        json.dump(parsed_images, json_file, indent=4)

    print(f"Se han guardado {len(parsed_images)} imágenes en {output_path}.")

# Llamar a la función principal
if __name__ == "__main__":
    save_images_to_json()
