import type { OfficialSourceId } from "../types";

export interface SourceEndpoint {
  id: string;
  source: OfficialSourceId;
  title: string;
  url: string;
  mediaType: "json" | "csv" | "xml" | "rss" | "pdf" | "html" | "text";
  required: boolean;
}

export function getSourceCatalog(taxYear: number): SourceEndpoint[] {
  return [
    {
      id: `boe-sumario-${taxYear}`,
      source: "boe",
      title: `BOE sumario y legislación fiscal ${taxYear}`,
      url: `https://www.boe.es/diario_boe/xml.php?id=BOE-S-${taxYear}0101`,
      mediaType: "xml",
      required: false
    },
    {
      id: `boe-busqueda-cotizacion-${taxYear}`,
      source: "boe",
      title: `BOE búsqueda cotización ${taxYear}`,
      url: `https://www.boe.es/buscar/legislacion.php?campo%5B0%5D=TITULO&dato%5B0%5D=cotizaci%C3%B3n%20${taxYear}`,
      mediaType: "html",
      required: false
    },
    {
      id: `aeat-retenciones-${taxYear}`,
      source: "aeat",
      title: `AEAT retenciones IRPF ${taxYear}`,
      url: process.env.AEAT_TAX_RATES_URL ?? "https://sede.agenciatributaria.gob.es/",
      mediaType: "html",
      required: false
    },
    {
      id: `seguridad-social-cotizacion-${taxYear}`,
      source: "seguridad-social",
      title: `Seguridad Social bases y tipos ${taxYear}`,
      url: process.env.SEG_SOCIAL_RATES_URL ?? "https://www.seg-social.es/",
      mediaType: "html",
      required: false
    }
  ];
}
