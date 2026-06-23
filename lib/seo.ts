import type { Metadata } from "next";

// Single source of truth for the social-share image and per-page SEO metadata.
// metadataBase (set in app/layout.tsx) resolves these relative URLs to absolute,
// which Open Graph and Twitter crawlers require.
export const OG_IMAGE = "/og-image.jpg";

export function pageMetadata({
  title,
  description,
  path = "/",
  image = OG_IMAGE,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: "Bleviq",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "Bleviq" }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}
