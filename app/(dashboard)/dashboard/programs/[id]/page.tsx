import { ProgramDetailsClient } from "./ProgramDetailsClient";

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ProgramDetailsClient id={id} />;
}
