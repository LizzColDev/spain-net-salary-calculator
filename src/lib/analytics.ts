export type AnalyticsEvent =
  | { name: "calculation_completed"; properties?: Record<string, string | number | boolean> }
  | { name: "simulation_shared"; properties?: Record<string, string | number | boolean> }
  | { name: "export_triggered"; properties?: Record<string, string | number | boolean> };

export function trackEvent(event: AnalyticsEvent) {
  if (process.env.NODE_ENV !== "production") return;
  window.dispatchEvent(new CustomEvent("analytics:event", { detail: event }));
}
