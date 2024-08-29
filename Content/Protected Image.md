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
