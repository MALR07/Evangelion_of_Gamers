# Evangelion of Gamers

Biblioteca personal y comunidad de videojuegos con React, Netlify Functions, PostgreSQL y Docker. RAWG proporciona búsqueda, portadas y logros disponibles en su catálogo.

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

Esto permite entrar en la sección de administración para gestionar usuarios y permisos.
La cuenta se crea si falta cuando la API inicializa el esquema de usuarios; el inicio de sesión ejecuta esa inicialización antes de comprobar las credenciales.

RAWG requiere una API key y la cobertura de logros varía según el juego. No se guarda ningún secreto de API en el navegador.

El emblema gráfico de Evangelion of Gamers se carga desde `logo.jpg` y se reutiliza en acceso, landing y barra lateral.
El footer muestra © 2026 y el crédito «Hecho por MALR07».
