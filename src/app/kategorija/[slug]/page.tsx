import { permanentRedirect } from "next/navigation";

export default async function KategorijaSlugRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  permanentRedirect(`/recepti/${slug}`);
}
