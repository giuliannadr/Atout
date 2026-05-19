# FDOS — Guía de configuración (Supabase)

## Paso 1 — Crear proyecto en Supabase

1. Andá a [supabase.com](https://supabase.com) y creá una cuenta gratuita.
2. Creá un **New Project** (elegí la región más cercana).
3. Guardá la contraseña del proyecto.

---

## Paso 2 — Obtener las credenciales

En el dashboard de tu proyecto Supabase:

1. Ir a **Settings > API**
2. Copiar:
   - **Project URL** → `https://xxxx.supabase.co`
   - **anon public** key → `eyJhbGci...`

---

## Paso 3 — Crear el archivo `.env.local`

En la raíz del proyecto, creá el archivo `.env.local`:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Paso 4 — Crear las tablas en Supabase

1. En tu dashboard Supabase → **SQL Editor > New query**
2. Pegá todo el contenido de `supabase_schema.sql`
3. Ejecutá con **Run**

---

## Paso 5 — Activar Google OAuth (opcional pero recomendado)

1. Ir a [Google Cloud Console](https://console.cloud.google.com) → **APIs & Services > Credentials**
2. Crear un **OAuth 2.0 Client ID** de tipo "Web application"
3. En **Authorized redirect URIs** agregar:
   ```
   https://tu-proyecto.supabase.co/auth/v1/callback
   ```
4. Copiar el **Client ID** y **Client Secret**
5. En Supabase → **Authentication > Providers > Google**
6. Pegar las credenciales y activar

---

## Paso 6 — Correr el proyecto

```bash
npm install
npm run dev
```

Abrí `http://localhost:5173` — verás la pantalla de login.

---

## Para producción (Vercel, Netlify, etc.)

Agregá las variables de entorno en el dashboard de tu hosting:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Y en Supabase → **Authentication > URL Configuration**, agregá tu dominio de producción en **Redirect URLs**.
