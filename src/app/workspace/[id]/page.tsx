import { notFound } from "next/navigation";
import { WorkspaceScreen } from "@/features/workspace/components/workspace-screen";
import { getWorkspaceSnapshot } from "@/features/workspace/lib/queries";
import { createClient } from "@/lib/supabase/server";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const snapshot = await getWorkspaceSnapshot(id);

  if (!snapshot) {
    notFound();
  }

  return (
    <WorkspaceScreen
      snapshot={snapshot}
      tripId={id}
      user={
        user
          ? {
              email: user.email,
              fullName: user.user_metadata?.full_name ?? user.user_metadata?.name,
              avatarUrl: user.user_metadata?.avatar_url,
            }
          : null
      }
    />
  );
}
