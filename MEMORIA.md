# 🧠 Memoria del Proyecto: FutbolExperto.com

Este documento resume los hitos, decisiones técnicas y funcionalidades implementadas en la transformación de **FutbolXP** a **FutbolExperto.com**.

## 🚀 Hitos Principales

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
- **Mapa del Torneo (Partidos)**: Creación de una sección visual con todas las tablas de grupos y un bracket de eliminatorias (desde dieciseisavos hasta la final).
- **Contadores de Noticias**: Implementación de badges dinámicos en la lista de jugadores que muestran cuántas notas hay asociadas a cada profesional.
- **SSR (Server Side Rendering)**: Activación de renderizado en el servidor para las páginas de Jugadores, Equipos y Partidos para garantizar datos actualizados.

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

---
*Última actualización: 16 de Marzo, 2026*
