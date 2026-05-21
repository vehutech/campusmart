import { Suspense } from "react";
import { ProductDetail } from "./product-detail";

export default function ProductPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:"calc(100vh - 64px)", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <div style={{color:"var(--text-muted)", fontSize:14}}>Loading product...</div>
      </div>
    }>
      <ProductDetail />
    </Suspense>
  );
}