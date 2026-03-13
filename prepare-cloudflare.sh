#!/bin/bash

# Script para preparar el proyecto de Astro v6 para Cloudflare
# Ejecutar en la raíz del proyecto

echo "🔧 Preparando proyecto para Cloudflare..."

# 1. Agregar dependencias faltantes
echo "📦 Instalando dependencias de desarrollo..."
bun add -d @astrojs/check typescript

# 2. Renombrar archivo de configuración (si existe)
if [ -f "src/content/config.ts" ]; then
  echo "📝 Renombrando src/content/config.ts -> src/content.config.ts"
  mv src/content/config.ts src/content.config.ts
else
  echo "✅ Archivo src/content.config.ts ya existe o no se encontró el legacy"
fi

# 3. Verificar que todo esté correcto
echo "✅ ¡Listo! Ahora haz:"
echo "   git add package.json package-lock.json src/content.config.ts"
echo "   git commit -m 'fix: preparar para Astro v6'"
echo "   git push"
echo ""
echo "Luego el build en Cloudflare debería funcionar."
