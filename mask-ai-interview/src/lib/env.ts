export function getAppEnv(): "LOCAL" | "PREVIEW" | "PROD" {
  const host = window.location.hostname;

  if (host.includes("localhost")) return "LOCAL";

  // Production domain (update if needed)
  if (
    host === "ai-persona-ux-interview.vercel.app" ||
    host === "mask.vercel.app"
  ) {
    return "PROD";
  }

  if (host.includes("vercel.app")) return "PREVIEW";

  return "PREVIEW";
}
