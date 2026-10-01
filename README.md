# 🎮 Evangelion of Gamers

<p align="center">
  <img src="logo.jpg" alt="Evangelion of Gamers Logo" width="180px" style="border-radius: 12px;"/>
</p>

<p align="center">
  <b>Tu biblioteca personal y centro neurálgico de videojuegos.</b><br>
  <i>Gestión de colecciones, listas comunitarias, logros y noticias en una sola plataforma.</i>
</p>

<p align="center">
  <a href="https://github.com/MALR07/Evangelion_of_Gamers"><img src="https://img.shields.io/badge/Repository-GitHub-181717?style=for-the-badge&logo=github" alt="GitHub Repo"></a>
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React">
  <img src="https://img.shields.io/badge/Netlify-Functions-00C7B7?style=for-the-badge&logo=netlify&logoColor=white" alt="Netlify Functions">
  <img src="https://img.shields.io/badge/PostgreSQL-15-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" alt="PostgreSQL">
  <img src="https://img.shields.io/badge/Docker-Ready-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
</p>

---

## 📖 Descripción

**Evangelion of Gamers** es una aplicación web *full-stack* pensada por y para amantes de los videojuegos. Permite llevar un control detallado de tu colección personal de juegos, explorar el catálogo global y consultar logros a través de la integración con **RAWG API**.

Además, ofrece un espacio social para crear y compartir listas personalizadas por año y secciones, seguir la actualidad del sector mediante feeds RSS automatizados (sin necesidad de APIs de pago) y disfrutar de una experiencia visual inmersiva con rotación de artes y soporte para modo oscuro.

---

## ✨ Características Principales

### 🔐 Autenticación y Privacidad
* **Seguridad:** Cifrado de contraseñas y gestión de sesiones mediante tokens.
* **Perfil Público vs. Privado:** Personalización de nombre público y avatar mediante URL HTTPS. El correo electrónico del usuario jamás se expone públicamente ni en listas compartidas.

### 📚 Gestión de Biblioteca
* **Integración RAWG API:** Búsqueda directa para importar títulos con su portada, título y fecha oficial.
* **Ficha Personalizable:** Edición de estado de juego, notas personales, puntuación numérica, estado de platino, contador de rejugado y recomendación.
* **Logros:** Consulta directa de los logros de la comunidad cuando RAWG dispone de ellos.
* **Aislamiento de Datos:** Cada usuario gestiona única y exclusivamente su propia biblioteca.

### 📋 Listas y Secciones
* Organiza tus juegos en **listas anuales** divididas en secciones personalizables con orden numérico editable.
* Visibilidad flexible: mantén tus listas **privadas** o colócalas en modo **público**.
* Las listas públicas permiten a otros usuarios **importar juegos** a su propia biblioteca con un clic.

### 📰 Noticias & Cobertura en Vivo
* **Feeds RSS Automatizados:** Carrusel de noticias recientes y análisis obtenidos desde *Vandal* y *Hobby Consolas*.
* **The Game Awards:** Sección dedicada a los premios con titulares actualizados automáticamente y acceso directo a la votación/nominados oficiales.

### 🎨 Experiencia Visual Dinámica
* **Modo Claro / Oscuro:** Preferencia persistente guardada en el navegador.
* **Barra Lateral Colapsable:** Interfaz limpia adaptada a tu espacio de pantalla.
* **Carrusel Inmersivo:** Rotación cada 45 segundos de *artworks* de sagas icónicas (*Destiny 1, Persona 5, Silent Hill, God of War, Spider-Man, Alan Wake 2, TLOU, BO3 Zombies, Death Stranding 2, Wolverine, NieR, Helldivers 2, Bloodborne y Cyberpunk*).
* **Imágenes Fallback:** Respaldo gráfico local asegurado si la API de RAWG presenta interrupciones.

### 🛡️ Panel de Administración
* Gestión avanzada de usuarios, contraseñas y roles visible únicamente para cuentas con permisos de administrador.
* **Inicialización Automática:** Si la base de datos no contiene cuentas al arrancar, el login detecta la falta del esquema y crea las credenciales de administrador base automáticamente.

---

## 🛠️ Stack Tecnológico

* **Frontend:** [React](https://reactjs.org/)
* **Backend:** [Netlify Functions](https://www.netlify.com/products/functions/) (Node.js Serverless)
* **Base de Datos:** [PostgreSQL](https://www.postgresql.org/)
* **Contenedores:** [Docker](https://www.docker.com/) & Docker Compose
* **API Externa:** [RAWG Video Games Database API](https://rawg.io/apidocs)

---

## 🚀 Instalación y Despliegue Local

### 1. Requisitos Previos
* Node.js (v18+)
* Docker y Docker Compose
* Una API Key gratuita de [RAWG](https://rawg.io/apidocs)

### 2. Pasos
```bash
# 1. Clonar el repositorio
git clone https://github.com/MALR07/Evangelion_of_Gamers.git
cd Evangelion_of_Gamers

# 2. Configurar variables de entorno (.env)
# Crea un archivo .env con las siguientes llaves:
# DATABASE_URL=postgresql://usuario:password@localhost:5432/evangelion_db
# RAWG_API_KEY=tu_rawg_api_key
# JWT_SECRET=tu_secreto_jwt

# 3. Levantar la base de datos con Docker
docker-compose up -d

# 4. Instalar dependencias e iniciar el servidor de desarrollo
npm install
npm run dev
```

---

## 👤 Autor

Desarrollado con pasión por **MALR07**.

* **GitHub:** [@MALR07](https://github.com/MALR07)
* **Proyecto:** [Evangelion_of_Gamers](https://github.com/MALR07/Evangelion_of_Gamers)

---

<p align="center">
  © 2026 <b>Evangelion of Gamers</b> — Hecho por <b>MALR07</b>
</p>
