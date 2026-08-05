import type { SourceDocument } from "../types";
import type { SourceEndpoint } from "../sources/catalog";
import { sha256 } from "../utils";

export function createDocument(endpoint: SourceEndpoint, content: string, fetchedAt: Date): SourceDocument {
  return {
    id: endpoint.id,
    source: endpoint.source,
    title: endpoint.title,
    url: endpoint.url,
    mediaType: endpoint.mediaType,
    fetchedAt: fetchedAt.toISOString(),
    content,
    checksum: sha256(content)
  };
}
