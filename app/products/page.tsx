import { Suspense } from "react";
import { ProductsContent } from "./products-content";

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div style={{minHeight:"calc(100vh - 64px)", background:"var(--bg)", display:"flex", alignItems:"center", justifyContent:"center"}}>
        <div style={{color:"var(--text-muted)", fontSize:14}}>Loading products...</div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}