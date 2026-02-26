import type { Metadata } from "next";
import { DEFAULT_META, SITE_NAME } from "./constants";

interface RecipeMetaParams {
  title: string;
  description?: string;
  image?: string | null;
  slug: string;
}

export function getRecipeMetadata({
  title,
  description,
  image,
  slug,
}: RecipeMetaParams): Metadata {
  const baseUrl = DEFAULT_META.url;
  const url = `${baseUrl}/recepti/${slug}`;
  const ogImage = image ? (image.startsWith("http") ? image : `${baseUrl}${image}`) : undefined;

  return {
    title: `${title} | ${SITE_NAME}`,
    description: description || DEFAULT_META.description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: description || DEFAULT_META.description,
      url,
      images: ogImage ? [{ url: ogImage }] : [],
      locale: DEFAULT_META.locale,
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
}

export function getListingMetadata(
  title: string,
  description?: string
): Metadata {
  return {
    title: `${title} | ${SITE_NAME}`,
    description: description || DEFAULT_META.description,
    openGraph: {
      title: `${title} | ${SITE_NAME}`,
      description: description || DEFAULT_META.description,
      locale: DEFAULT_META.locale,
    },
  };
}
