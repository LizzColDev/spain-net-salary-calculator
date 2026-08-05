import type { ExtractContext, SourceConnector, SourceDocument } from "../types";
import { getSourceCatalog } from "../sources/catalog";
import { fetchText } from "../utils";
import { createDocument } from "./create-document";

export const seguridadSocialConnector: SourceConnector = {
  id: "seguridad-social",
  name: "Seguridad Social",
  async extract(context: ExtractContext): Promise<SourceDocument[]> {
    const now = context.now ?? new Date();
    const endpoints = getSourceCatalog(context.taxYear).filter((endpoint) => endpoint.source === "seguridad-social");

    return Promise.all(
      endpoints.map(async (endpoint) => {
        const content = await fetchText(endpoint.url, context.fetcher);
        return createDocument(endpoint, content, now);
      })
    );
  }
};
