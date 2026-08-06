# Calculadora de Salario Neto en España

Aplicación Next.js para calcular salario neto, IRPF, cotizaciones, coste empresa y escenarios salariales comparados en España.

## Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- Componentes estilo shadcn/ui
- TanStack Query
- Recharts
- Framer Motion
- Vitest

## Arquitectura

```text
src/
  app/                 Rutas, API, SEO, manifest y errores
  components/          UI y calculadora
  engine/              Motor fiscal puro y testeable
  tax-engine/
    data/              Datasets fiscales versionados
    etl/               Pipeline de actualización fiscal
  hooks/               Hooks de cliente
  lib/                 API client, seguridad, SEO, analítica y monitorización
  types/               Tipos compartidos
```

El motor fiscal no contiene porcentajes legales. Consume `TaxDataset` desde `src/tax-engine/data/current.json`.

## Desarrollo

### Requisitos

- Node.js 24 LTS
- pnpm

```bash
nvm use
pnpm install
pnpm dev
```

## Calidad

```bash
pnpm typecheck
pnpm test
pnpm build
```

## Actualización Fiscal

```bash
pnpm tax:update --year 2027
```

El pipeline:

1. Descarga fuentes oficiales.
2. Extrae hechos fiscales estructurados.
3. Construye un dataset candidato.
4. Valida estructura, comunidades, porcentajes, bases y rangos.
5. Ejecuta tests.
6. Escribe `src/tax-engine/data/{year}.json`.
7. Actualiza `current.json`.
8. Genera `*.diff.json` y `*.summary.json`.

Consulta `src/tax-engine/etl/README.md` para los detalles.

## API

| Método | Endpoint |
| --- | --- |
| GET | `/api/tax-rates` |
| GET | `/api/regions` |
| POST | `/api/calculate` |
| POST | `/api/update-tax-data` |

## Producción

Variables recomendadas:

```bash
NEXT_PUBLIC_SITE_URL=https://tu-dominio.com
TAX_DATA_UPDATE_TOKEN=token-seguro
SENTRY_DSN=
NEXT_PUBLIC_GA_MEASUREMENT_ID=
NEXT_PUBLIC_PLAUSIBLE_DOMAIN=
NEXT_PUBLIC_CLARITY_PROJECT_ID=
```

La aplicación incluye:

- Headers de seguridad
- CSP
- Rate limiting básico en API
- Sitemap
- Robots
- RSS
- Manifest
- JSON-LD
- OpenGraph
- Twitter Cards
- Error boundary
- Preparación para analítica y monitorización

## Despliegue en Vercel

1. Configura las variables de entorno anteriores.
2. Ejecuta `pnpm build` en CI.
3. Publica desde la raíz del proyecto.
4. Ejecuta `pnpm tax:update --year YYYY` cuando haya cambios normativos validados.

## Aviso

La aplicación ofrece estimaciones avanzadas. Antes de usarla como referencia fiscal o laboral vinculante, cada dataset debe validarse contra fuentes oficiales y casos reales de nómina.
