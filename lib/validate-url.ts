// Shared, dependency-free validation for a website link. Used client-side for
// instant feedback before submitting, and server-side as a safety net. Returns
// a friendly error message, or null when the input is a usable website URL.
export function siteUrlError(input: string): string | null {
  const raw = (input || "").trim();
  if (!raw) return "Add your website link to get started.";

  let url: URL;
  try {
    url = new URL(/^https?:\/\//i.test(raw) ? raw : "https://" + raw);
  } catch {
    return "That does not look like a valid website link.";
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return "Use a web address that starts with http or https.";
  }

  // Must be a real domain: valid labels, at least one dot, and a 2+ letter TLD.
  const host = url.hostname;
  const domainOk =
    /^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/i.test(host);
  if (!domainOk) {
    return "Enter a full website address, like yourwebsite.com.";
  }

  return null;
}
