export default async function SharePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return <main />;
}
