import { DemoWorkspaceEntry } from "@/features/workspace/components/demo-workspace-entry";
import { DUMMY_WORKSPACE_SNAPSHOT } from "@/lib/dummy-data";

export default function WorkspaceDemoPage() {
  return <DemoWorkspaceEntry snapshot={DUMMY_WORKSPACE_SNAPSHOT} />;
}
