import { Suspense } from "react";
import SetPasswordPage from "./SetPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetPasswordPage />
    </Suspense>
  );
}
