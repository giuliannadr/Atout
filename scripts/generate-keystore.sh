#!/usr/bin/env bash
# ── Genera el keystore de firma para releases de Android ──────────────────────
# Ejecutar UNA sola vez. Guardar el .keystore en lugar seguro (no en git).
# Usage: bash scripts/generate-keystore.sh

set -e

KEYSTORE="android/atout-release.keystore"
ALIAS="atout"

echo ""
echo "🔑 Generando keystore para Atout Android..."
echo "   Guardá las contraseñas en un lugar seguro (password manager)."
echo ""

keytool -genkey -v \
  -keystore "$KEYSTORE" \
  -alias "$ALIAS" \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000 \
  -dname "CN=Atout, OU=Mobile, O=Atout, L=Buenos Aires, ST=Buenos Aires, C=AR"

echo ""
echo "✅ Keystore generado en: $KEYSTORE"
echo ""
echo "Próximos pasos:"
echo "  1. Copiá android/key.properties.example → android/key.properties"
echo "  2. Completá las contraseñas en key.properties"
echo "  3. Guardá el archivo .keystore en un lugar seguro (Dropbox/Drive cifrado)"
echo ""
echo "Para CI/CD (GitHub Secrets), generá el base64 del keystore:"
echo "  base64 -i android/atout-release.keystore | tr -d '\\n'"
echo "  → Copiá el resultado como secret ANDROID_KEYSTORE_BASE64"
