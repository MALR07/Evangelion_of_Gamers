# Evangelion of Gamers

Biblioteca personal y comunidad de videojuegos con React, Netlify Functions, PostgreSQL y Docker. RAWG proporciona búsqueda, portadas y logros disponibles en su catálogo.

## Desarrollo con Docker

Requisitos: Docker Desktop y una clave API gratuita de RAWG (<https://rawg.io/apidocs>).

1. Copia `.env.example` a `.env` y añade tu `RAWG_API_KEY`.
2. Desde esta carpeta, ejecuta `docker compose up --build`.
3. Abre <http://localhost:8888>.

PostgreSQL y la web se ejecutan en contenedores separados. La base de datos conserva los datos en el volumen `postgres_data`. Para detener los servicios usa `docker compose down`; no borres el volumen si quieres conservar las cuentas y colecciones.

El código del proyecto está montado dentro del contenedor y Vite vigila los cambios mediante polling, por lo que los cambios de frontend se aplican sin reconstruir. Usa `docker compose up --build` cuando cambies dependencias o el `Dockerfile`.

## Publicar en Netlify

Netlify aloja el frontend y las funciones Node, pero no una instancia PostgreSQL persistente. Crea una base PostgreSQL gestionada (por ejemplo, Neon), ejecuta el contenido de `database/init.sql` en su consola SQL y guarda la URL de conexión.

1. Sube esta carpeta a un repositorio Git y conéctalo a Netlify.
2. Netlify detecta `netlify.toml`: comando `npm run build`, carpeta publicada `dist` y funciones en `netlify/functions`.
3. En las variables de entorno del sitio configura `DATABASE_URL` (URL de PostgreSQL con SSL), `JWT_SECRET` (secreto aleatorio largo), `RAWG_API_KEY` y `VITE_GOOGLE_CLIENT_ID`.
4. En Google Cloud crea un cliente OAuth de tipo aplicación web y añade el dominio local/producción a sus orígenes autorizados; `VITE_GOOGLE_CLIENT_ID` habilita el botón oficial de Google y el servidor verifica la firma y el correo verificado.
5. Opcionalmente, añade `VITE_LINKEDIN_URL`, `VITE_PORTFOLIO_URL` y `VITE_GITHUB_URL` con tus perfiles; los iconos del footer se activan al configurar cada dirección.
6. Despliega el sitio. Las rutas `/api/*` se envían a la función serverless.

La aplicación usa el mismo PostgreSQL y funciones para el desarrollo local y producción. Las cuentas creadas localmente viven en Docker; las de producción viven en la base de datos gestionada.

## Funcionalidad

- Registro e inicio de sesión con contraseña cifrada y token de sesión.
- Elegir un nombre público al registrarse y actualizar nombre o foto desde Mi perfil; el autor de listas no revela el correo. La foto usa una URL HTTPS pública.
- Buscar juegos en RAWG y añadir nombre, portada y fecha a la biblioteca personal.
- Editar estado, nota, nota numérica, platino, rejugado y recomendación.
- Consultar logros comunitarios cuando RAWG dispone de ellos.
- Cada usuario solo puede leer y modificar su propia biblioteca.
- Crear varias listas por año, con secciones y juegos numerados editables; cada lista se puede compartir o mantener privada. Las listas públicas pueden importar juegos a la biblioteca propia y no muestran correos ni bibliotecas privadas.
- Añadir juegos de la biblioteca a secciones de listas personales.
- Cambiar entre tema claro y oscuro, con preferencia guardada en el navegador; plegar la barra lateral.
- Consultar titulares y análisis recientes de Vandal y Hobby Consolas desde sus RSS, sin necesitar una API de noticias; el carrusel se refresca automáticamente.
- Rotar cada 45 segundos artwork de Destiny 1, Persona 5, Silent Hill, God of War, Spider-Man, Alan Wake 2, The Last of Us, BO3 Zombies, Death Stranding 2, Wolverine, NieR, Helldivers 2, Bloodborne y Cyberpunk; hay imágenes de respaldo si RAWG no responde.
- Consultar noticias relacionadas con The Game Awards y abrir la página oficial de nominados; el año y los titulares se actualizan automáticamente.
- Administrar usuarios, permisos y contraseñas desde la sección Administración, visible para cuentas admin.

## Credenciales de administrador

Usuario administrador por defecto:
- Email: admin@savepoint.com
- Usuario: admin
- Contraseña: admin17

Esto permite entrar en la sección de administración para gestionar usuarios y permisos.
La cuenta se crea si falta cuando la API inicializa el esquema de usuarios; el inicio de sesión ejecuta esa inicialización antes de comprobar las credenciales.

RAWG requiere una API key y la cobertura de logros varía según el juego. No se guarda ningún secreto de API en el navegador.

El emblema gráfico de Evangelion of Gamers se carga desde `logo.jpg` y se reutiliza en acceso, landing y barra lateral.
El footer muestra © 2026 y el crédito «Hecho por MALR07».
