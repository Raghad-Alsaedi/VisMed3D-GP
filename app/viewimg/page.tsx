export const dynamic = 'force-dynamic'

import ViewImg from "@/components/ViewImg";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ViewImg />
    </Suspense>
  );
}

