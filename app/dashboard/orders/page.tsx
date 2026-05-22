// app/dashboard/orders/page.tsx
import { Suspense } from "react";
import { OrdersContent } from "./orders-content";

export default function OrdersPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"calc(100vh - 64px)",background:"var(--bg)"}} />}>
      <OrdersContent />
    </Suspense>
  );
}