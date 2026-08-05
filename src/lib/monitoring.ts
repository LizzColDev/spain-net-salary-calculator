export function captureException(error: unknown, context?: Record<string, unknown>) {
  if (process.env.NODE_ENV !== "production") {
    console.error(error, context);
    return;
  }

  window.dispatchEvent(new CustomEvent("monitoring:error", { detail: { error, context } }));
}
