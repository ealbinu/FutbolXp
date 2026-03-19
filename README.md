# FutbolExperto ⚽

Sitio editorial sobre **futbol, selecciones, jugadores y actualidad**.
Desarrollado con **Astro 6** y desplegado en **Cloudflare Pages**.

## 🚀 Características

- ✅ **Home editorial** con noticias, análisis y acceso a secciones clave
- ✅ **Analista** con tarjetas y comparativas basadas en noticias recientes
- ✅ **Noticias actualizadas** desde PocketBase y fuentes procesadas por scripts
- ✅ **Jugadores con cobertura activa**: solo se muestran perfiles con noticias asociadas
- ✅ **Perfiles de equipos y jugadores** con contexto editorial
- ✅ **Tu 11** integrado mediante **iframe externo**
- ✅ **Diseño responsive** con estética neobrutalista y foco mobile
- ✅ **Despliegue automático** en Cloudflare Pages y automatización con GitHub Actions

## 📦 Estructura del proyecto

```bash
FutbolXp/
├── src/
│   ├── components/        # Componentes reutilizables
│   ├── content/           # Datos estáticos tipados
│   ├── layouts/           # Layout principal
│   ├── lib/               # PocketBase, utilidades y lógica editorial
│   └── pages/             # Rutas del sitio
├── scripts/               # Automatizaciones (news updater)
├── public/                # Assets públicos
├── .github/workflows/     # Workflows de GitHub Actions
├── astro.config.mjs
├── cloudflare.toml
├── package.json
├── MEMORIA.md
└── README.md
```

## 🛠️ Instalación y desarrollo

```bash
git clone <tu-repo>
cd FutbolXp
npm install
cp .env.example .env
npm run dev
```

Comandos útiles:

```bash
npm run dev       # desarrollo
npm run build     # build de producción
npm run preview   # preview local
npm run update-news
```

## 🔐 Variables de entorno

Configura al menos:

```bash
PUBLIC_POCKETBASE_URL=https://futbolxp.pockethost.io
POCKETBASE_URL=https://futbolxp.pockethost.io
POCKETBASE_EMAIL=superuser@example.com
POCKETBASE_PASSWORD=change-me
```

Opcionales para crawling / integraciones:

```bash
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

## 🔄 Actualización de noticias

El proyecto usa `scripts/update-news.js` y workflows de GitHub Actions para refrescar contenido editorial.

### Flujo general
- obtiene noticias desde feeds / fuentes configuradas
- procesa y normaliza datos
- actualiza PocketBase / contenido relacionado
- evita duplicados

### Ejecución manual

```bash
npm run update-news
```

## ☁️ Despliegue en Cloudflare Pages

Config recomendado:

- **Build command**: `npm run build`
- **Build output directory**: `dist`
- **Variables de entorno**:
  - `PUBLIC_POCKETBASE_URL`
  - `POCKETBASE_URL`
  - `POCKETBASE_EMAIL`
  - `POCKETBASE_PASSWORD`

## 🧩 Estado actual del producto

### Secciones activas
- `/`
- `/noticias`
- `/analista`
- `/analista/comparar`
- `/jugadores`
- `/jugador/[id]`
- `/equipo/[id]`
- `/tu-11`

### Notas recientes
- la sección **Partidos** fue retirada
- **Jugadores** ahora filtra perfiles sin noticias
- se eliminaron referencias visibles a “mundial” del producto principal
- **Tu 11** ahora usa un **iframe externo** para la experiencia interactiva

## 📝 Notas técnicas

- **Astro 6** con render server-side donde hace falta
- **PocketBase** como backend de contenido dinámico
- **Cloudflare Pages** para despliegue
- **CSS vanilla** con estilos custom
- **JSON-LD**, metadata SEO y sitemap

## 📄 Licencia

MIT © 2026 FutbolExperto
