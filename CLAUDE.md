# CLAUDE.md

## Descripción del proyecto

July Tracker es una aplicación **React** desplegada en producción en
**https://july-tracker-five.vercel.app** (Vercel).

## Estructura del código

- El código principal de la app vive en `july-tracker/src/App.js`.
- Punto de entrada: `july-tracker/src/index.js`.

> Nota: el código de la app está dentro de la subcarpeta `july-tracker/`, no en la
> raíz del repositorio.

## Despliegue

El despliegue es automático en Vercel a partir de la rama `main`.

## Convenciones para hacer push

- Hacer push usando **HTTPS** con el **token personal de GitHub** (no SSH).
- **No** escribir el token en archivos versionados (incluido este). Configurarlo
  mediante el credential helper de git o pasarlo en la URL remota localmente, por
  ejemplo:

  ```bash
  git remote set-url origin https://<TU_TOKEN>@github.com/ofeliacerveroal-lab/july-tracker.git
  ```

  Sustituyendo `<TU_TOKEN>` por el token real solo en tu entorno local.
