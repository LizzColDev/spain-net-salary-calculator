import type { ExtractContext, SourceConnector, SourceDocument } from "../types";
import { aeatConnector } from "./aeat";
import { boeConnector } from "./boe";
import { seguridadSocialConnector } from "./seguridad-social";

export const connectors: SourceConnector[] = [aeatConnector, seguridadSocialConnector, boeConnector];

export async function extractOfficialDocuments(context: ExtractContext, selectedConnectors = connectors): Promise<SourceDocument[]> {
  const batches = await Promise.all(selectedConnectors.map((connector) => connector.extract(context)));
  return batches.flat();
}
