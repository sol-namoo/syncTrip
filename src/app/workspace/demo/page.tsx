import { WorkspaceScreen } from "@/features/workspace/components/workspace-screen";
import { buildWorkspaceActor } from "@/features/workspace/lib/access";
import { DUMMY_WORKSPACE_SNAPSHOT } from "@/lib/dummy-data";

export default function WorkspaceDemoPage() {
  return (
    <WorkspaceScreen
      snapshot={DUMMY_WORKSPACE_SNAPSHOT}
      tripId="demo"
      actor={buildWorkspaceActor({
        role: "demo",
        user: {
          id: "demo-user",
          email: "demo@synctrip.local",
          fullName: "Demo User",
          avatarUrl: undefined,
        },
      })}
    />
  );
}
