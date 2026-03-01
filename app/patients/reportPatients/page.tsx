import ShowReport from "@/components/ShowReport";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ShowReport />
    </Suspense>
  );
}
