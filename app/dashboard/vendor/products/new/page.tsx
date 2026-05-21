import { Suspense } from "react";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"calc(100vh - 64px)", background:"var(--bg)"}} />}>
      <ProductForm mode="create" />
    </Suspense>
  );
}