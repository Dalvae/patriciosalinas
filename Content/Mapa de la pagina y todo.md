# Home

## Biografía

## El ultimo Baile

## Anders Petersen

## Encuentros

## Notas de Atacama

## Kyssen på Bar la Concha

# Prensa

# Proyectos

## SOBRE LA HUELLA DE WALTER BENJAMIN

## ATACAMA | Geometría de un cautiverio | EXPOSICION Y LIBRO

# Galeria F48

# Ensayos

## Sergio Larrain Ingles

## Walter Benjamin Ingles

## Fotografi – en introduktion Svenska

## Tránsitos: la huella de la impermanencia

## LAS ÚLTIMAS HUELLAS DE UN “FLÂNEUR”

## Home - Biografia

## Projectos

## Ensayos

## Galerias

## Videos

## Prensa

## Exposiciones: distintas exposiciones en los últimos tres años

## Contacto ** Esto lo vamos a a poner el home y tambien en el footer**

Patricio Salinas A <patricio.salinas.a@gmail.com>
4 ago 2024, 3:06 p.m.
para mí
Sobre las distintas bajadas, títulos o como le llames:
Proyectos: Atacama; Walter Benjamin; Los otros; Barcelona
Publicaciones: Sobre Barcelona, Atacama, Walter Benjamin y 365
Videos: distintos videos de presentación de mi trabajo. También entrevistas
Prensa: distintas publicaciones de prensa sobre mi trabajo (máximo 4 de ellas)
Exposiciones: distintas exposiciones en los últimos tres años
Galeria: Obra en venta....distintas imágenes de distintos periodos, de alta calidad visual y de contenido y que estarían a la venta
Sobre el autor: una reseña general, una especie de CV abreviado
Contacto: Cómo llegar a contactar al autor

Saque la parte de Books

- The last dance en ingles debe ser en mayuscula titulo

-- TODO segurizar mas las imagenes

Tienes razón, el ejemplo que te proporcioné utiliza `Next.js`, que no es compatible directamente con Astro. Vamos a adaptarlo para que funcione en un entorno de Astro utilizando middleware propio o funciones de servidor que puedes definir con Node.js o Express.

### 1. **Configurar una Función de Servidor en Astro**

Si estás utilizando un backend en Node.js con Astro, puedes crear una API personalizada que maneje la entrega de imágenes:

```javascript
// /src/pages/api/serve-image.js
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key";

export async function get({ params, url }) {
  const token = url.searchParams.get("token");

  if (!token) {
    return {
      status: 403,
      body: "Forbidden",
    };
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    const imageUrl = decoded.url;

    const response = await fetch(imageUrl);

    if (!response.ok) {
      return {
        status: 404,
        body: "Image not found",
      };
    }

    const imageBuffer = await response.buffer();

    return {
      status: 200,
      headers: {
        "Content-Type": "image/jpeg", // o el tipo correcto de imagen
      },
      body: imageBuffer,
    };
  } catch (error) {
    return {
      status: 403,
      body: "Forbidden",
    };
  }
}
```

### 2. **Generar URLs Seguras en Astro**

En tu componente Astro, puedes generar la URL segura con el token:

```typescript
import jwt from "jsonwebtoken";

export interface Props {
  src: string;
  alt: string;
  width: number | string;
  height: number | string;
}

const { src, alt, width, height } = Astro.props;

const SECRET_KEY = import.meta.env.SECRET_KEY;
const token = jwt.sign({ url: src }, SECRET_KEY, { expiresIn: "5m" });
const secureUrl = `/api/serve-image?token=${token}`;
```

### 3. **Cargar la Imagen en el Canvas**

Usa `secureUrl` para cargar la imagen en el canvas, como antes:

```javascript
function loadProtectedImages() {
  const canvases = document.querySelectorAll(
    ".protected-image-container canvas"
  );
  canvases.forEach((canvas) => {
    if (canvas instanceof HTMLCanvasElement) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = canvas.dataset.src || ""; // aquí usas secureUrl
        img.onload = function () {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const text = "© Patricio Salinas";
          const fontSize = 20;
          const margin = 20;
          ctx.font = `${fontSize}px Arial`;
          ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
          const textWidth = ctx.measureText(text).width;
          ctx.fillText(
            text,
            canvas.width - textWidth - margin,
            canvas.height - margin
          );
        };
      }
    }
  });
}
```

### 4. **Configurar el Entorno**

Asegúrate de que `SECRET_KEY` esté configurado correctamente en tu entorno de producción (`.env` o en la configuración de Vercel). Esto asegurará que los tokens sean seguros y que solo los clientes autorizados puedan acceder a las imágenes.

Este enfoque te permitirá servir imágenes de manera segura utilizando Astro y Node.js, sin depender de `Next.js`.
