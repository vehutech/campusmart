// app/cart/page.tsx
import { Suspense } from "react";
import { CartContent } from "./cart-content";

export default function CartPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"calc(100vh - 64px)",background:"var(--bg)"}} />}>
      <CartContent />
    </Suspense>
  );
}