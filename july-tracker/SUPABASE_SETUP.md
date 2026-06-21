# Configurar Supabase (datos compartidos entre la clienta y July)

Sigue estos pasos **una sola vez**. Cuando termines, tú y July veréis las
mismas fotos y datos, cada una desde su propio móvil.

## 1. Crear el proyecto (gratis)

1. Entra en https://supabase.com y crea una cuenta (gratis).
2. **New project** → ponle un nombre (p. ej. `july-tracker`) y una contraseña
   para la base de datos. Elige la región más cercana (Europa).
3. Espera ~2 minutos a que se cree.

## 2. Crear la tabla y los permisos

En el menú de la izquierda → **SQL Editor** → **New query** → pega esto y pulsa
**Run**:

```sql
-- Tabla clave-valor: una fila por tipo de dato (comidas, tensión, peso).
create table if not exists public.kv (
  key        text primary key,
  value      jsonb,
  updated_at timestamptz default now()
);

-- Activar acceso desde la app (los dos usuarios usan la misma clave pública).
alter table public.kv enable row level security;

create policy "lectura y escritura abierta"
  on public.kv for all
  using (true) with check (true);

-- Activar la sincronización en tiempo real.
alter publication supabase_realtime add table public.kv;
```

## 3. Copiar las credenciales

Menú izquierdo → **Project Settings** (rueda dentada) → **API**. Copia:

- **Project URL** → va en `REACT_APP_SUPABASE_URL`
- **anon public** (en "Project API keys") → va en `REACT_APP_SUPABASE_ANON_KEY`

## 4. Configurar en local

En la carpeta `july-tracker/july-tracker/`, copia `.env.local.example` a
`.env.local` y pega tus dos valores. Luego reinicia `npm start`.

## 5. Configurar en Vercel (producción)

En el proyecto de Vercel → **Settings** → **Environment Variables**, añade las
dos variables (`REACT_APP_SUPABASE_URL` y `REACT_APP_SUPABASE_ANON_KEY`) con los
mismos valores. Luego haz un **Redeploy** para que la web en producción las use.

## Notas

- Si las variables no están configuradas, la app sigue funcionando en modo
  local (cada dispositivo guarda lo suyo) — no se rompe nada.
- Las fotos se guardan comprimidas (~800px). Para dos usuarias es de sobra con
  el plan gratuito de Supabase.
