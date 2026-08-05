export const siteConfig = {
  name: "Calculadora de salario neto en España",
  shortName: "Salario Neto ES",
  description: "Calcula salario neto, IRPF, cotizaciones, coste empresa y escenarios salariales en España.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  locale: "es_ES",
  twitterHandle: ""
};

export function absoluteUrl(path = "/") {
  return new URL(path, siteConfig.url).toString();
}
