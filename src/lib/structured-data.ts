import { absoluteUrl, siteConfig } from "./site";

export function getStructuredData() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: siteConfig.name,
      url: absoluteUrl("/"),
      potentialAction: {
        "@type": "SearchAction",
        target: `${absoluteUrl("/")}?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: siteConfig.name,
      applicationCategory: "FinanceApplication",
      operatingSystem: "Web",
      url: absoluteUrl("/"),
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: absoluteUrl("/") },
        { "@type": "ListItem", position: 2, name: "Calculadora de salario neto", item: absoluteUrl("/") }
      ]
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: [
        {
          "@type": "Question",
          name: "¿La calculadora sustituye a una asesoría fiscal?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. La herramienta ofrece una estimación avanzada y depende de datasets fiscales validados."
          }
        },
        {
          "@type": "Question",
          name: "¿Se pueden comparar dos escenarios?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Sí. El comparador permite contrastar salario, comunidad, contrato, IRPF y otros supuestos."
          }
        }
      ]
    }
  ];
}
