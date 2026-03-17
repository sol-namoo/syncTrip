import { WorkspaceScreen } from "@/features/workspace/components/workspace-screen";
import { DUMMY_WORKSPACE_SNAPSHOT } from "@/lib/dummy-data";

export default function WorkspaceDemoPage() {
  return (
    <WorkspaceScreen
      snapshot={DUMMY_WORKSPACE_SNAPSHOT}
      tripId="demo"
      user={{
        email: "demo@synctrip.local",
        fullName: "Demo User",
        avatarUrl: undefined,
      }}
    />
  );
}
