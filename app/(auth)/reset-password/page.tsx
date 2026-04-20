import { Suspense } from "react";
import ResetPasswordPage from "./ReSetPasswordClient";

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordPage />
    </Suspense>
  );
}
