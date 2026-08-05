import { absoluteUrl, siteConfig } from "@/lib/site";

export function GET() {
  const body = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>${siteConfig.name}</title>
    <link>${absoluteUrl("/")}</link>
    <description>${siteConfig.description}</description>
    <language>es-ES</language>
    <item>
      <title>Calculadora de salario neto en España</title>
      <link>${absoluteUrl("/")}</link>
      <guid>${absoluteUrl("/")}</guid>
      <description>Herramienta profesional para estimar salario neto, IRPF, cotizaciones y coste empresa.</description>
    </item>
  </channel>
</rss>`;

  return new Response(body, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400"
    }
  });
}
