# Fútbol Experto 2026 🌍⚽

Sitio de cobertura del **Mundial 2026** (México, USA, Canadá).  
Desarrollado con **Astro 6** y desplegado en **Cloudflare Pages**.

## 🚀 Características

- ✅ **Listado de 48 equipos** del Mundial 2026 (clasificados y en proceso)
- ✅ **Noticias actualizadas cada 3 horas** desde fuentes RSS (ESPN, Marca, BBC, etc.)
- ✅ **Perfiles de jugadores** con noticias y enlaces a redes sociales
- ✅ **Integración de redes sociales** (Twitter, Instagram, TikTok, Facebook)
- ✅ **Diseño moderno y responsive** con tema oscuro y acentos futuristas
- ✅ **Filtrado por continente, equipo y posición**
- ✅ **Despliegue automático** en Cloudflare Pages via GitHub Actions

## 📦 Estructura del proyecto

```
futbol-experto-2026/
├── src/
│   ├── layouts/          # Layout principal (Layout.astro)
│   ├── pages/            # Páginas del sitio
│   │   ├── index.astro   # Home - grid de todos los equipos
│   │   ├── equipo/[id].astro  # Página de equipo individual
│   │   ├── jugadores.astro    # Lista de todos los jugadores
│   │   └── jugador/[id].astro # Página de jugador individual
│   ├── components/       # Componentes reutilizables (pendientes)
│   ├── content/          # Datos estáticos
│   │   ├── config.ts     # Colecciones de datos (teams, players)
│   │   ├── teams/data.js # Datos de los 48 equipos
│   │   └── players/data.js # Datos de jugadores
│   └── lib/              # Utilidades (API clients, etc.)
├── scripts/
│   └── update-news.js    # Script de actualización de noticias
├── .github/
│   └── workflows/
│       └── update-deploy.yml  # GitHub Actions (cada 3h)
├── public/
│   └── favicon.svg
├── package.json
├── astro.config.mjs
├── tsconfig.json
└── .gitignore
```

## 🛠️ Instalación y desarrollo

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/futbol-experto-2026.git
cd futbol-experto-2026

# Instalar dependencias (requiere Node.js 22+)
npm install

# Configurar variables de entorno
cp .env.example .env

# Iniciar servidor de desarrollo
npm run dev
# Abre http://localhost:4321

# Build de producción
npm run build

# Preview del build
npm run preview
```

## 🔐 Variables de entorno

El proyecto ya no usa credenciales hardcodeadas. Configura al menos:

```bash
PUBLIC_POCKETBASE_URL=https://futbolxp.pockethost.io
POCKETBASE_URL=https://futbolxp.pockethost.io
POCKETBASE_EMAIL=superuser@example.com
POCKETBASE_PASSWORD=change-me
```

Opcionales para crawling con Cloudflare:

```bash
CLOUDFLARE_ACCOUNT_ID=
CLOUDFLARE_API_TOKEN=
```

## 🔄 Actualización automática de noticias

El sitio se actualiza automáticamente cada **3 horas** mediante GitHub Actions:

1. **`scripts/update-news.js`**:
   - Obtiene noticias de feeds RSS (ESPN, Marca, BBC Sport, etc.)
   - Filtra noticias relevantes para cada equipo/jugador usando keywords
   - Actualiza `src/content/teams/data.js` con nuevas noticias
   - Evita duplicados por URL

2. **`.github/workflows/update-deploy.yml`**:
   - Se ejecuta cada 3 horas (`0 */3 * * *`)
   - Corre `npm run update-news`
   - Commit y push de cambios
   - Build y deploy a Cloudflare Pages

### Ejecución manual de actualización

```bash
npm run update-news
```

## ☁️ Despliegue en Cloudflare Pages

1. Ve a [Cloudflare Pages](https://pages.cloudflare.com/)
2. Conecta tu repositorio de GitHub
3. Selecciona el proyecto `futbol-experto-2026`
4. Configura:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist`
   - **Environment variables**: `PUBLIC_POCKETBASE_URL`, `POCKETBASE_URL`, `POCKETBASE_EMAIL`, `POCKETBASE_PASSWORD`
5. Guarda y despliega

**Nota**: Asegúrate de que el repositorio esté en GitHub y que el workflow de GitHub Actions esté configurado para actualizar automáticamente los datos.

## 🧩 Extensiones futuras

- [ ] API de Twitter/X (para tweets oficiales de jugadores)
- [ ] API de Instagram (posts y stories)
- [ ] Estadísticas en tiempo real (API de FIFA)
- [ ] Tabla de grupos y posiciones
- [ ] Sistema de predicciones para usuarios
- [ ] Chatbot con IA para preguntas sobre equipos/jugadores
- [ ] Versión móvil nativa (PWA)

## 📝 Notas técnicas

- **Astro 6** con Vite para desarrollo rápido y bundling optimizado
- **Colecciones de contenido** tipadas con Zod para validación
- **RSS parser** para obtención de noticias
- **CSS moderno** con CSS Grid, Flexbox, variables CSS y animaciones
- **Sin dependencias pesadas** (solo Astro + rss-parser)
- **Totalmente estático** (excepto actualizaciones via GitHub Actions)

## 📄 Licencia

MIT © 2026 Fútbol Experto

---

**¡Vamos México, USA y Canadá 2026!** 🏆🇲🇽🇺🇸🇨🇦