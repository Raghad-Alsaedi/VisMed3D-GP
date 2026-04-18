export const dynamic = 'force-dynamic'

import { Suspense } from "react";
import TF from "@/components/TF";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <TF />
    </Suspense>
  );
}
