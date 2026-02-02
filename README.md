🔥 Burned 
Burned es una aplicación web full-stack diseñada para compartir, descubrir y gestionar recetas de cocina. El proyecto implementa una arquitectura moderna de microservicios desacoplados, priorizando la escalabilidad, la seguridad y una experiencia de usuario fluida (UX).

🛠️ Stack Tecnológico
Frontend (Cliente)
Core: React (Vite)

Estilos: Tailwind CSS (Diseño responsivo y animaciones personalizadas)

Estado y Rutas: React Hooks, React Router DOM

Comunicación HTTP: Axios (con interceptores para manejo de tokens)

Validación IA: NSFWJS (TensorFlow.js) para filtrado de imágenes en el cliente.

Iconografía: Lucide React.

Backend (Servidor)
Lenguaje: Go (Golang)

Framework: Gin Gonic (Alto rendimiento y baja latencia).

Arquitectura: Clean Architecture (Handlers, Services, Repositories).

Seguridad: JWT (JSON Web Tokens), CORS configurado para producción.

Base de Datos y Servicios Externos
Base de Datos: MongoDB Atlas (NoSQL).

Almacenamiento de Medios: Cloudinary.

Autenticación Social: Google OAuth 2.0.

Despliegue: Render.

⚙️ Arquitectura y Funcionamiento
1. Despliegue e Infraestructura (Render)
El proyecto está desplegado en Render utilizando dos servicios web separados para garantizar la separación de responsabilidades:

Frontend Service: Aloja la SPA (Single Page Application) construida con Vite.

Backend Service: Ejecuta el binario compilado de Go.

Comunicación: El frontend consume la API REST del backend a través de HTTPS. La seguridad de esta conexión se gestiona mediante CORS (Cross-Origin Resource Sharing), permitiendo peticiones únicamente desde el dominio verificado del frontend (FRONTEND_URL en variables de entorno).

2. Base de Datos (MongoDB Atlas)
Se utiliza MongoDB por su flexibilidad para manejar documentos JSON con estructuras anidadas, ideal para almacenar recetas que contienen arrays de ingredientes y pasos de longitud variable.

Driver: Se utiliza el driver oficial mongo-driver de Go.

Conexión: Gestionada mediante MONGO_URI seguro, utilizando un pool de conexiones para optimizar el rendimiento bajo carga.

3. Autenticación y Seguridad (JWT + Google OAuth)
El sistema implementa una estrategia de seguridad híbrida:

JWT (JSON Web Tokens):

Al iniciar sesión (Email/Pass o Google), el backend firma un token JWT que contiene el userId y role.

Frontend: Un interceptor de Axios inyecta automáticamente este token en el header Authorization: Bearer <token> de cada petición protegida.

Backend: Un middleware personalizado (AuthMiddleware) intercepta las peticiones, valida la firma del token y extrae el userId para inyectarlo en el contexto de Gin, asegurando que el controlador tenga acceso seguro a la identidad del usuario.

Google OAuth 2.0:

Implementado manualmente en el backend para control total. El flujo intercambia el código de autorización de Google por un token de acceso, verifica el email y busca o crea el usuario en nuestra base de datos antes de emitir nuestro propio JWT.

4. Gestión de Imágenes (Cloudinary + IA)
Para optimizar el ancho de banda del servidor, la gestión de imágenes sigue un patrón Client-Side Upload:

Validación IA: Antes de subir nada, el navegador utiliza NSFWJS para analizar la imagen localmente. Si detecta contenido inapropiado, bloquea la subida inmediatamente.

Subida Directa: Si la imagen es segura, el frontend la sube directamente a Cloudinary usando un Unsigned Preset.

Persistencia: Cloudinary devuelve una URL pública segura (https://res.cloudinary...), que es lo único que se envía al backend de Go para guardarse en MongoDB. Esto reduce drásticamente la carga y latencia del servidor.
