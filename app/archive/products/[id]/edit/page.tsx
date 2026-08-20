import { ProductFormView } from "@/app/archive/_components/ProductFormView";

export default async function EditArchiveProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ProductFormView productId={id} />;
}
