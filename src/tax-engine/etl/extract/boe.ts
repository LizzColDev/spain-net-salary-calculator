import type { ExtractContext, SourceConnector, SourceDocument } from "../types";
import { getSourceCatalog } from "../sources/catalog";
import { fetchText } from "../utils";
import { createDocument } from "./create-document";

export const boeConnector: SourceConnector = {
  id: "boe",
  name: "Boletín Oficial del Estado",
  async extract(context: ExtractContext): Promise<SourceDocument[]> {
    const now = context.now ?? new Date();
    const endpoints = getSourceCatalog(context.taxYear).filter((endpoint) => endpoint.source === "boe");
    const documents: SourceDocument[] = [];

    for (const endpoint of endpoints) {
      try {
        const content = await fetchText(endpoint.url, context.fetcher);
        documents.push(createDocument(endpoint, content, now));
      } catch (error) {
        if (endpoint.required) throw error;
      }
    }

    return documents;
  }
};
