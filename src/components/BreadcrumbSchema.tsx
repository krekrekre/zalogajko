import { DEFAULT_META } from "@/lib/constants";

export interface BreadcrumbItem {
  name: string;
  path: string;
}

interface BreadcrumbSchemaProps {
  items: BreadcrumbItem[];
}

/**
 * BreadcrumbList JSON-LD for recipe and category pages.
 * Enables breadcrumb display in Google SERP.
 */
export function BreadcrumbSchema({ items }: BreadcrumbSchemaProps) {
  const baseUrl = DEFAULT_META.url;

  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
