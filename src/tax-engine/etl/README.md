# Tax Engine ETL

Este directorio contiene el pipeline que mantiene los datos legales usados por el motor fiscal.

## Estructura

- `sources/`: catálogo de fuentes oficiales y endpoints.
- `extract/`: conectores independientes para AEAT, Seguridad Social y BOE.
- `transform/`: conversión de documentos oficiales en hechos fiscales normalizados.
- `validators/`: validación de estructura, comunidades, rangos, bases, SMI y porcentajes.
- `load/`: escritura versionada de datasets y generación de informes de cambios.

## Principio de seguridad

El motor fiscal nunca contiene porcentajes legales. Solo consume `TaxDataset`.

El ETL no publica un dataset si no encuentra hechos fiscales estructurados. Esto evita que un cambio de página HTML oficial genere un falso positivo. Si una fuente no ofrece API pública, el conector debe descargar evidencia oficial y el transformador solo debe extraer datos cuando el formato sea estable:

- JSON oficial
- CSV oficial
- XML/RSS oficial
- PDF/tablas procesadas por extractor dedicado y validado
- HTML con datos embebidos estructurados, no selectores visuales frágiles

## Comando

```bash
pnpm tax:update --year 2027
```

Pasos:

1. Descarga documentos oficiales necesarios.
2. Extrae hechos fiscales.
3. Construye `TaxDataset`.
4. Valida estructura y rangos.
5. Ejecuta tests.
6. Escribe `src/tax-engine/data/2027.json`.
7. Actualiza `current.json`.
8. Genera `2027.diff.json` y `2027.summary.json`.

## Opciones

```bash
pnpm tax:update --year 2027 --dry-run
pnpm tax:update --year 2027 --skip-tests
pnpm tax:update --year 2027 --force-same-year
pnpm tax:update --year 2027 --allow-empty-facts
```

`--allow-empty-facts` solo debe usarse para pruebas controladas. En producción, una actualización sin hechos estructurados debe cancelarse.

## Variables opcionales

Puedes apuntar a endpoints oficiales concretos si AEAT o Seguridad Social publican un recurso estructurado nuevo:

```bash
AEAT_TAX_RATES_URL=https://...
SEG_SOCIAL_RATES_URL=https://...
```

## Versionado

Cada año se guarda como archivo independiente:

- `2026.json`
- `2027.json`
- `2028.json`

Los datasets históricos no se sobrescriben por defecto. `current.json` apunta siempre al dataset activo usado por la aplicación.

## Informe de cambios

El loader genera un diff por categorías:

- porcentajes
- comunidades
- bases
- deducciones
- metadatos

Esto permite revisar qué ha cambiado antes de desplegar.
