import type { Metadata } from "next";
import { DEFAULT_META, SITE_NAME } from "./constants";

interface RecipeMetaParams {
  title: string;
  description?: string;
  image?: string | null;
  slug: string;
  /** Canonical path e.g. /recepti/hladna-predjela/podvarak-10. If omitted, uses /recepti/{slug}. */
  canonicalPath?: string;
  /** ISO date string — helps Google show freshness */
  publishedTime?: string | null;
  modifiedTime?: string | null;
  keywords?: string[] | null;
}

export function getRecipeMetadata({
  title,
  description,
  image,
  slug,
  canonicalPath,
  publishedTime,
  modifiedTime,
  keywords,
}: RecipeMetaParams): Metadata {
  const baseUrl = DEFAULT_META.url;
  const url = canonicalPath ? `${baseUrl}${canonicalPath}` : `${baseUrl}/recepti/${slug}`;
  const ogImage = image ? (image.startsWith("http") ? image : `${baseUrl}${image}`) : undefined;

  const meta: Metadata = {
    title: `${title} | ${SITE_NAME}`,
    description: description || DEFAULT_META.description,
    openGraph: {
      type: "article",
      title: `${title} | ${SITE_NAME}`,
      description: description || DEFAULT_META.description,
      url,
      images: ogImage ? [{ url: ogImage }] : [],
      locale: DEFAULT_META.locale,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description: description || DEFAULT_META.description,
      images: ogImage ? [ogImage] : [],
    },
    alternates: {
      canonical: url,
    },
  };

  if (keywords?.length) {
    meta.keywords = keywords;
  }

  return meta;
}

interface ListingMetaParams {
  title: string;
  description?: string;
  /** Full path without origin, e.g. "/recepti" or "/recepti/corba" — sets canonical + OG url */
  path?: string;
}

export function getListingMetadata(
  titleOrParams: string | ListingMetaParams,
  description?: string
): Metadata {
  const title = typeof titleOrParams === "string" ? titleOrParams : titleOrParams.title;
  const desc =
    typeof titleOrParams === "string" ? description : titleOrParams.description ?? description;
  const path = typeof titleOrParams === "string" ? undefined : titleOrParams.path;

  const baseUrl = DEFAULT_META.url;
  const url = path ? `${baseUrl}${path}` : undefined;

  return {
    title: `${title} | ${SITE_NAME}`,
    description: desc || DEFAULT_META.description,
    ...(url && {
      alternates: { canonical: url },
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description: desc || DEFAULT_META.description,
        url,
        locale: DEFAULT_META.locale,
      },
    }),
    ...(!url && {
      openGraph: {
        title: `${title} | ${SITE_NAME}`,
        description: desc || DEFAULT_META.description,
        locale: DEFAULT_META.locale,
      },
    }),
  };
}
