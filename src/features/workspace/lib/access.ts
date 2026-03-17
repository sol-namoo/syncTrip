import type {
  WorkspaceActor,
  WorkspaceCapabilities,
  WorkspaceMember,
  WorkspaceRole,
} from "@/types/workspace";

export function buildWorkspaceCapabilities(
  role: WorkspaceRole
): WorkspaceCapabilities {
  switch (role) {
    case "demo":
      return {
        canPersist: false,
        canInvite: false,
        canExport: false,
        canDeleteTrip: false,
        canManageTrip: false,
        canEditItems: true,
      };
    case "owner":
      return {
        canPersist: true,
        canInvite: true,
        canExport: true,
        canDeleteTrip: true,
        canManageTrip: true,
        canEditItems: true,
      };
    case "editor":
      return {
        canPersist: true,
        canInvite: false,
        canExport: true,
        canDeleteTrip: false,
        canManageTrip: false,
        canEditItems: true,
      };
    case "viewer":
    default:
      return {
        canPersist: false,
        canInvite: false,
        canExport: true,
        canDeleteTrip: false,
        canManageTrip: false,
        canEditItems: false,
      };
  }
}

export function resolveWorkspaceRole(
  userId: string | null | undefined,
  members: WorkspaceMember[]
): WorkspaceRole {
  if (!userId) {
    return "viewer";
  }

  const member = members.find((item) => item.userId === userId);

  if (!member) {
    return "viewer";
  }

  if (member.role === "owner") {
    return "owner";
  }

  return "editor";
}

export function buildWorkspaceActor(input: {
  role: WorkspaceRole;
  user: WorkspaceActor["user"];
}): WorkspaceActor {
  return {
    role: input.role,
    capabilities: buildWorkspaceCapabilities(input.role),
    user: input.user,
  };
}
