# Atout — Guía de Deploy

Un solo repo, tres plataformas. El mismo código React/Vite se despliega como web, app de escritorio y app mobile.

```
src/  (React + Vite)
  └── dist/  ← build compartido
        ├── 🌐  Web     → Vercel  (auto-deploy en push a main)
        ├── 🖥️  Desktop → Electron (.exe / .dmg / .AppImage)
        └── 📱  Mobile  → Capacitor (APK Android / IPA iOS)
```

---

## 🔑 Variables de entorno necesarias

Creá un archivo `.env` en la raíz (nunca se commitea):

```env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
VITE_APP_URL=https://tu-app.vercel.app
```

En Vercel y en GitHub Secrets tenés que cargar estas tres mismas variables.

---

## 🌐 1. Web (Vercel)

### Setup inicial (una sola vez)

1. Entrá a [vercel.com](https://vercel.com) → **Add New Project**
2. Importá el repo `giuliannadr/Atout` desde GitHub
3. Framework Preset: **Vite**
4. En **Environment Variables** agregá:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (la URL que te da Vercel, ej: `https://atout.vercel.app`)
5. Click **Deploy**

### Deploy automático

A partir de ahí, **cada push a `main` hace deploy automático**. No necesitás hacer nada más.

### Dominio personalizado (opcional)

En Vercel → Settings → Domains → agregá `app.tudominio.com`.

---

## 🖥️ 2. Desktop (Electron)

### Para usuarios: cómo descargar

Cuando publiques una versión, los instaladores quedan en:
```
https://github.com/giuliannadr/Atout/releases
```
- **Windows**: descargá el `.exe` → siguiente, siguiente, instalar
- **Mac**: descargá el `.dmg` → arrastrá Atout a Aplicaciones
- **Linux**: descargá el `.AppImage` → dalo ejecutable (`chmod +x`) y ejecutá

### Publicar una nueva versión

```bash
# 1. Actualizá la versión en package.json
npm version patch   # 1.0.0 → 1.0.1
# o: npm version minor / major

# 2. Pusheá el tag — GitHub Actions construye y publica automáticamente
git push && git push --tags
```

GitHub Actions va a:
1. Buildear para Windows, Mac y Linux en paralelo
2. Crear un GitHub Release con los 3 instaladores adjuntos

### Compilar localmente

```bash
npm run electron:build:win    # .exe para Windows
npm run electron:build:mac    # .dmg para Mac (solo en Mac)
npm run electron:build:linux  # .AppImage para Linux
```

### Auto-update

La app ya tiene configurado `electron-updater`. Cuando el usuario abre la app, revisa si hay una nueva versión en GitHub Releases y la ofrece automáticamente.

> ⚠️ **Firma de código**: sin firma, Windows muestra SmartScreen ("app desconocida") y Mac pide autorización en Preferencias del Sistema. Para producción comercial se puede agregar un certificado de firma después.

---

## 📱 3. Mobile (Capacitor)

### Cómo funciona

Capacitor toma el build de Vite (`dist/`) y lo sirve dentro de una app nativa. Es la **misma app web** empaquetada como app móvil real.

### 🤖 Android

#### Opción A — APK directo (sin costo, inmediato)

Los APKs se generan automáticamente en GitHub Actions con cada tag de versión.

**Para el usuario:**
1. En el teléfono Android: Ajustes → Seguridad → activar **"Instalar apps de fuentes desconocidas"**
2. Entrar a `github.com/giuliannadr/Atout/releases` desde el teléfono
3. Descargar `app-release.apk`
4. Tocar el archivo descargado → Instalar

#### Opción B — Google Play Store (recomendado para producción)

**Costo:** USD 25 pago único (cuenta de desarrollador Google)

**Pasos:**

1. **Generá el keystore de firma** (una sola vez, en tu máquina):
   ```bash
   bash scripts/generate-keystore.sh
   ```
   Guardá el `.keystore` en un lugar seguro (Dropbox/Drive cifrado). **Si lo perdés, no podés actualizar la app en Play.**

2. **Copiá y completá la config de firma:**
   ```bash
   cp android/key.properties.example android/key.properties
   # Editá android/key.properties con tus contraseñas
   ```

3. **Configurá GitHub Secrets** (para que CI pueda firmar):
   - `ANDROID_KEYSTORE_BASE64` — resultado de: `base64 -i android/atout-release.keystore | tr -d '\n'`
   - `ANDROID_KEY_ALIAS` — el alias que pusiste (ej: `atout`)
   - `ANDROID_KEY_PASSWORD` — contraseña de la key
   - `ANDROID_STORE_PASSWORD` — contraseña del store

4. **Creá la cuenta en [Google Play Console](https://play.google.com/console)**

5. **Publicá la primera versión:**
   - Pusheá un tag: `git tag v1.0.0 && git push --tags`
   - GitHub Actions genera el `.aab` firmado
   - Descargá el artefacto `atout-android` → `app-release.aab`
   - Subilo en Play Console → Producción → Nueva versión

6. **Actualizaciones futuras:** solo subís el nuevo `.aab` en Play Console. Google Play hace el rollout automáticamente.

#### Desarrollo local Android

```bash
# Requiere Android Studio instalado
npm run mobile:android   # Abre Android Studio con el proyecto
npm run mobile:run:android  # Corre en un emulador o dispositivo conectado
```

---

### 🍎 iOS

#### Opción A — PWA "Add to Home Screen" (gratis, sin cuenta Apple)

La app ya está configurada como PWA. En iPhone/iPad:
1. Abrir **Safari** en `https://atout.vercel.app`
2. Tocar el ícono **Compartir** → **"Agregar a pantalla de inicio"**
3. La app aparece como ícono en el home, funciona sin internet (modo offline básico)

**Limitaciones vs app nativa:** no aparece en App Store, no tiene notificaciones push nativas.

#### Opción B — App Store (para distribución profesional)

**Costo:** USD 99/año (Apple Developer Program)

**Pasos:**
1. Registrarte en [developer.apple.com](https://developer.apple.com)
2. En Xcode (Mac requerido): abrí `ios/App/App.xcworkspace`
3. En el proyecto, seleccioná tu Apple ID como Team
4. Configurá el Bundle ID: `com.atout.app`
5. Archivá la app: **Product → Archive**
6. Distribuí via Xcode a App Store Connect
7. En App Store Connect completá la ficha de la app y enviá a revisión

#### TestFlight (beta testing iOS, antes de publicar)

Con la cuenta de Apple Developer podés distribuir la app a hasta **10.000 testers** gratis via TestFlight antes de publicarla en el store.

#### Desarrollo local iOS

```bash
# Solo en Mac con Xcode instalado
npm run mobile:ios       # Abre Xcode con el proyecto
npm run mobile:run:ios   # Corre en simulador o iPhone conectado
```

---

## 🗄️ Base de datos (Supabase)

La base de datos es **Supabase** (PostgreSQL en la nube). Está compartida entre web, desktop y mobile — todas las plataformas leen/escriben los mismos datos del usuario.

### Estado actual
- ✅ El schema ya está en `supabase_schema.sql`
- ✅ La auth (email + Google OAuth) ya funciona
- ✅ Las variables de entorno ya están configuradas

### Checklist de producción

En [supabase.com/dashboard](https://supabase.com/dashboard) verificá:

**Auth:**
- [ ] Site URL apunta a `https://atout.vercel.app` (no localhost)
- [ ] Redirect URLs incluyen `https://atout.vercel.app/**`
- [ ] Google OAuth configurado con el dominio correcto

**Database:**
- [ ] Row Level Security (RLS) activo en todas las tablas
- [ ] Políticas de RLS: cada usuario solo lee/escribe sus propios datos

**API:**
- [ ] La anon key es segura de usar en el cliente (solo accede a lo que RLS permite)
- [ ] No hay datos sensibles expuestos sin RLS

### Backup

Supabase hace backups automáticos diarios en el plan Pro. En el plan Free, podés exportar manualmente desde el dashboard.

---

## 🚀 Workflow completo para publicar una nueva versión

```bash
# 1. Terminá los cambios y testeá
npm run dev

# 2. Actualizá la versión
npm version patch  # o minor / major

# 3. Subí a main
git push && git push --tags
```

GitHub Actions hace automáticamente:
- ✅ Type-check + build de validación
- ✅ Deploy web a Vercel
- ✅ Build de instaladores Windows / Mac / Linux
- ✅ Build de APK + AAB de Android
- ✅ Crea GitHub Release con todos los archivos adjuntos

---

## 📊 Resumen de costos

| Plataforma | Hosting | Costo |
|-----------|---------|-------|
| Web | Vercel Free | **Gratis** |
| Desktop (Windows/Mac/Linux) | GitHub Releases | **Gratis** |
| Android APK directo | GitHub Releases | **Gratis** |
| Android Google Play | Google Play Console | **USD 25 único** |
| iOS App Store | Apple Developer | **USD 99/año** |
| Base de datos | Supabase Free (hasta 500MB) | **Gratis** |

> Para empezar: web + desktop + APK directo Android es 100% gratis. Play Store y App Store se agregan cuando tengas usuarios reales.
