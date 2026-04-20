import { Suspense } from "react";
import SetPasswordClient from "./SetPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetPasswordClient />
    </Suspense>
  );
}
