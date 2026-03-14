export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <main />;
}
