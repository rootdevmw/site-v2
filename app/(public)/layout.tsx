import { PublicFooter } from "@/components/public/PublicFooter";
import { PublicHeader } from "@/components/public/PublicHeader";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#fbfcf8] text-[#18342f]">
      <PublicHeader />
      <main>{children}</main>
      <PublicFooter />
    </div>
  );
}
