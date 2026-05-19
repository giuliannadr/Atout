-- ============================================================
-- FDOS · Freelance Dev OS — Supabase Schema
-- Pegá esto en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ─── TABLA: projects ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.projects (
  id          UUID PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  data        JSONB NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own projects"
  ON public.projects
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índice para consultas por usuario
CREATE INDEX IF NOT EXISTS projects_user_id_idx ON public.projects (user_id);


-- ─── TABLA: user_settings ──────────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  data        JSONB NOT NULL DEFAULT '{}'::jsonb,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own settings"
  ON public.user_settings
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);


-- ─── FUNCTION: auto-update updated_at ──────────────────────
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER on_settings_updated
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();


-- ─── POLICY: lectura pública por ID (Client View) ─────────
-- El UUID es prácticamente imposible de adivinar; funciona como share token.
CREATE POLICY "Public read by project ID"
  ON public.projects
  FOR SELECT
  USING (true);


-- ─── TABLA: promo_codes ────────────────────────────────────
-- Códigos creados manualmente por el admin (vos).
-- profile_type: 'developer' | 'community_manager'
-- plan: 'pro' | 'agency'
CREATE TABLE IF NOT EXISTS public.promo_codes (
  code          TEXT PRIMARY KEY,
  profile_type  TEXT NOT NULL CHECK (profile_type IN ('developer','community_manager')),
  plan          TEXT NOT NULL CHECK (plan IN ('pro','agency')),
  duration_days INT  NOT NULL DEFAULT 365,
  description   TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Los códigos no tienen RLS (son de lectura pública en la función)
-- La función usa SECURITY DEFINER para acceder directamente.


-- ─── TABLA: promo_redemptions ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.promo_redemptions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  code        TEXT NOT NULL REFERENCES public.promo_codes(code),
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at  TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, code)
);

ALTER TABLE public.promo_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users see their own redemptions"
  ON public.promo_redemptions
  FOR SELECT
  USING (auth.uid() = user_id);


-- ─── FUNCTION: redeem_promo_code ───────────────────────────
-- Llamar desde el cliente:  supabase.rpc('redeem_promo_code', { p_code: 'DEVPACK2025' })
-- Retorna JSON: { ok, plan, expires_at, message }
CREATE OR REPLACE FUNCTION public.redeem_promo_code(p_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id     UUID;
  v_code_row    public.promo_codes%ROWTYPE;
  v_expires_at  TIMESTAMPTZ;
  v_already     BOOLEAN;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('ok', false, 'message', 'No autenticado.');
  END IF;

  SELECT * INTO v_code_row FROM public.promo_codes WHERE code = upper(p_code);
  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Código no válido.');
  END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.promo_redemptions WHERE user_id = v_user_id AND code = upper(p_code)
  ) INTO v_already;
  IF v_already THEN
    RETURN jsonb_build_object('ok', false, 'message', 'Este código ya fue canjeado.');
  END IF;

  v_expires_at := now() + (v_code_row.duration_days || ' days')::INTERVAL;

  INSERT INTO public.promo_redemptions (user_id, code, expires_at)
  VALUES (v_user_id, upper(p_code), v_expires_at);

  RETURN jsonb_build_object(
    'ok',         true,
    'plan',       v_code_row.plan,
    'expires_at', v_expires_at,
    'message',    '¡Código aplicado! Plan ' || v_code_row.plan || ' activo hasta ' || to_char(v_expires_at, 'DD/MM/YYYY') || '.'
  );
END;
$$;


-- ─── CÓDIGOS DE EJEMPLO (editá según tus packs) ────────────
-- Insertá los códigos de tus packs de productos digitales aquí.
-- Podés agregar/quitar códigos desde el SQL Editor de Supabase.
--
-- INSERT INTO public.promo_codes (code, profile_type, plan, duration_days, description)
-- VALUES
--   ('DEVPACK2025',   'developer',         'pro',    365, 'Pack Developer Web 2025'),
--   ('CMPACK2025',    'community_manager', 'pro',    365, 'Pack Community Manager 2025'),
--   ('AGENCYDEV',     'developer',         'agency', 365, 'Pack Agencia Dev 2025'),
--   ('AGENCYCM',      'community_manager', 'agency', 365, 'Pack Agencia CM 2025');


-- ─── INSTRUCCIONES PARA GOOGLE AUTH ────────────────────────
-- 1. Andá a: Authentication > Providers > Google
-- 2. Habilitalo y pegá el Client ID y Client Secret de Google Cloud Console:
--    https://console.cloud.google.com/apis/credentials
-- 3. En Google Cloud, agregá como "Authorized redirect URIs":
--    https://<tu-proyecto>.supabase.co/auth/v1/callback
-- 4. Guardá y listo.
