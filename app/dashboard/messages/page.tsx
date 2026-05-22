// app/dashboard/messages/page.tsx

import { Suspense } from "react";
import { MessagesContent } from "./messages-content";

export default function MessagesPage() {
  return (
    <Suspense fallback={<div style={{minHeight:"calc(100vh - 64px)",background:"var(--bg)"}} />}>
      <MessagesContent />
    </Suspense>
  );
}