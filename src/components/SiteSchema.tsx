import { DEFAULT_META, SITE_NAME, SITE_DESCRIPTION } from "@/lib/constants";

/**
 * Organization + WebSite JSON-LD for the root layout.
 * Helps search engines understand the site and can enable Sitelinks Search Box.
 */
export function SiteSchema() {
  const baseUrl = DEFAULT_META.url;

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        "@id": `${baseUrl}/#organization`,
        name: SITE_NAME,
        url: baseUrl,
        description: SITE_DESCRIPTION,
      },
      {
        "@type": "WebSite",
        "@id": `${baseUrl}/#website`,
        url: baseUrl,
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        publisher: { "@id": `${baseUrl}/#organization` },
        inLanguage: "sr-RS",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${baseUrl}/recepti?sastojak={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
