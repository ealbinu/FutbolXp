# 🧠 Memoria del Proyecto: FutbolExperto.com

Este documento resume los hitos, decisiones técnicas y funcionalidades implementadas en la transformación de **FutbolXP** a **FutbolExperto.com**.

## 🚀 Hitos Principales

### 0. Última Iteración: Analista, limpieza editorial y simplificación de producto
- **Sección Analista**: Creación de `/analista`, detalle por selección `/analista/[id]` y comparador `/analista/comparar` con lógica editorial determinista basada en noticias recientes de PocketBase.
- **Integración transversal**: Módulos de Analista añadidos en Home y en `src/pages/equipo/[id].astro`.
- **Micrográficas**: Nuevo componente reusable `src/components/TrendMiniChart.astro` para visualizar `trendLine` como sparkline SVG.
- **Simplificación editorial**: Se redujo densidad de contenido en tarjetas, resúmenes, señales, fortalezas y riesgos para mejorar escaneo visual.
- **Pulido responsive**: Corrección de solapamientos, badges, headlines largas, bloques de comparación y gutters laterales para evitar que el contenido toque los bordes del navegador.
- **Comparador visual**: Mejora de `/analista/comparar` para mantener layout izquierda-vs-derecha al cambiar selecciones, con eje visual central de VS.
- **Logo animado**: El balón del header quedó sin borde y con una animación sutil de rebote/deformación.
- **Seguridad**: Eliminación de credenciales hardcodeadas en `scripts/update-news.js` y `src/pages/api/subscribe.ts`; migración a variables de entorno.
- **Compatibilidad / deprecaciones**: `src/content.config.ts` actualizado para usar `z` desde `astro/zod`, eliminando warnings del build.
- **Documentación**: Añadido `.env.example` y actualización de `README.md` para setup de variables de entorno.
- **SEO / GEO**: Refuerzo global de metadata (`canonical`, `robots`, Open Graph, Twitter, `hreflang`, `author`, `referrer`) y JSON-LD global para `Organization`, `WebSite`, `WebPage` y `SportsEvent`.
- **Structured data por página**: Añadidos `BreadcrumbList`, `CollectionPage`, `SportsTeam`, `Person` y `AnalysisNewsArticle` en páginas clave para enriquecer SEO técnico y motores generativos.
- **Assets SEO**: Creación de `public/og-image.svg` como imagen social por defecto.
- **robots / sitemap**: `robots.txt` actualizado para desautorizar `/api/` y validación de `sitemap-index.xml` + `sitemap-0.xml` generados por Astro.
- **Performance inicial**: Optimización de fuentes en `Layout.astro` (eliminación de carga duplicada, menos pesos) y uso de `content-visibility`/`contain-intrinsic-size` en secciones bajo el fold de la home para mejorar FCP/LCP.
- **Performance final mobile**: Eliminación de Google Fonts del critical path, uso de stack del sistema, diferimiento de GTM y reducción de banderas de `flagcdn` a tamaños más ligeros. Resultado validado en PageSpeed móvil: **Performance 99 / Accessibility 96 / Best Practices 100 / SEO 100**.
- **Plan de jugadores (fase A)**: Se amplió el esquema de jugadores para soportar `status`, `club`, `clubCountry`, `source`, `sourceUrl`, `lastVerified`, `caps`, `goals`, `isCaptain` y `aliases`. También se adaptó la UI de `jugadores.astro` y `jugador/[id].astro` para exponer estado, club y trazabilidad editorial, preparando el terreno para importación masiva de prelistas.
- **Jugadores con cobertura**: La lista `/jugadores` ahora solo muestra perfiles con noticias asociadas; además, si un jugador no tiene noticias, su detalle redirige de vuelta a `/jugadores`.
- **Eliminación de Partidos**: Se retiró la sección `/partidos`, se quitó del menú principal y del sitemap manual para simplificar el producto.
- **Limpieza de lenguaje**: Se eliminaron referencias visibles a “mundial” en home, noticias, analista, jugadores, equipos, footer, metadatos y OG image, sustituyéndolas por variantes más neutrales como `Futbol 2026` o `futbol`.
- **Home simplificada**: Se eliminó del hero el bloque de stats (`Equipos`, `Ciudades`, `Países Sede`) y el subtítulo basado en sedes; fue reemplazado por un mensaje editorial más genérico sobre noticias, análisis y seguimiento del futbol.
- **Tu 11 (embed externo)**: El experimento interactivo propio de `/tu-11` fue retirado por bugs de usabilidad y estabilidad. La ruta se conserva dentro del sitio, pero ahora carga un desarrollo externo mediante iframe (`https://futbol-sim-2d-5676525826.us-west1.run.app`) manteniendo el contenedor editorial de FutbolExperto.

### 1. Rebranding & Identidad Visual
- **Cambio de Nombre**: Transmisión de toda la marca a `FutbolExperto.com`.
- **Estética Neo-brutalista**: Diseño estrictamente plano, sin sombras ni rellenos en estados activos, basado en bordes gruesos y tipografía *Google Sans Flex*.
- **Fondo Interactivo**: Implementación de un sistema de partículas en Blanco y Negro reactivo al ratón mediante Canvas para un toque premium.
- **Favicon**: Actualización al emoji de balón (⚽).

### 2. Automatización de Contenido
- **News Updater**: Configuración de GitHub Actions para ejecutar el script de captura de noticias cada 3 horas.
- **Integración con PocketBase**: Conexión robusta para almacenar noticias, equipos y jugadores en tiempo real.
- **Limpieza de Datos**: Eliminación de enlaces `example.com` y textos simulados cortados, reemplazándolos por resúmenes de calidad de al menos dos párrafos.

### 3. Funcionalidades de Seguimiento
- **Contadores de Noticias**: Implementación de badges dinámicos en la lista de jugadores que muestran cuántas notas hay asociadas a cada profesional.
- **SSR (Server Side Rendering)**: Activación de renderizado en el servidor para las páginas de Jugadores y Equipos para garantizar datos actualizados.

### 4. SEO, GEO & Analítica
- **Optimización para Buscadores (SEO)**: Implementación de etiquetas Open Graph, Twitter Cards, Sitemap dinámico y robots.txt.
- **Optimización para IAs (GEO)**: Inclusión de esquemas JSON-LD (`NewsArticle`, `SportsEvent`, `WebSite`) para mejorar la visibilidad en motores generativos.
- **Google Tag Manager**: Integración completa del contenedor `GTM-W8QJ8Z9T` en el `<head>` y `<body>`.

## 🛠️ Stack Tecnológico
- **Frontend**: Astro (Modo SSR)
- **Despliegue**: Cloudflare Pages
- **Base de Datos**: PocketBase
- **Automatización**: GitHub Actions
- **Estilos**: Vanilla CSS (PostCSS)

## 📌 Notas Técnicas de Mantenimiento
- Para forzar una actualización de noticias manual: Ejecutar `npm run update-news`.
- El script de noticias incluye `process.exit(0)` para garantizar que el workflow de GitHub termine correctamente.
- La configuración de Cloudflare tiene activada la compatibilidad con el adaptador `@astrojs/cloudflare`.

### 1. Grupos del Mundial 2026 — Completados (Abril 2026)
- **48 equipos confirmados** tras el repechaje intercontinental de marzo 2026.
- Equipos del playoff ahora integrados al data.json con grupo, continente y `qualified: true`:
  - **Grupo A**: República Checa (antes `qualified: false`)
  - **Grupo B**: Bosnia y Herzegovina (nuevo)
  - **Grupo D**: Turquía (antes `qualified: false`)
  - **Grupo F**: Suecia (antes `qualified: false`)
  - **Grupo I**: Irak (nuevo)
  - **Grupo K**: RD Congo (nuevo)
- **Continentes corregidos** (antes "Por Definir"): Haití → North America, Curazao → North America, Noruega → Europe, Catar → Asia, Cabo Verde → Africa.
- Grupos ya correctos confirmados: C, E, G, J, L.
- **Corrección de fix RSS**: El script `update-news.js` ahora procesa artículos RSS primero (240 artículos) antes que el crawl de Cloudflare, resolviendo bug donde 147 artículos vacíos del crawl bloqueaban el guardado. Límite subido de 60 → 100.

---
*Última actualización: 4 de Abril, 2026*
