import DropFile from "@/components/DropFile";
import { Suspense } from "react";

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DropFile />
    </Suspense>
  );
}