import { ProgramTemplateDetailsClient } from "./ProgramDetailsTemplateClient";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <ProgramTemplateDetailsClient id={id} />;
}
