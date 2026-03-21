import type {
  RealtimeChannel,
  RealtimePresenceState,
  SupabaseClient,
} from "@supabase/supabase-js";
import type { Database } from "@/types/database";
import type { WorkspacePresenceMeta, WorkspaceChannelTopic } from "@/types/realtime";
import type { PresenceUser, WorkspaceMember } from "@/types/workspace";

export function buildWorkspaceChannelTopic(tripId: string): WorkspaceChannelTopic {
  return `workspace:${tripId}`;
}

export function buildWorkspacePresenceKey(userId: string, tabId: string) {
  return `${userId}:${tabId}`;
}

export function createWorkspaceRealtimeChannel(
  supabase: SupabaseClient<Database>,
  args: {
    tripId: string;
    presenceKey: string;
  }
): RealtimeChannel {
  return supabase.channel(buildWorkspaceChannelTopic(args.tripId), {
    config: {
      private: true,
      broadcast: { self: false },
      presence: { key: args.presenceKey },
    },
  });
}

export function buildPresenceUsersFromState(
  state: RealtimePresenceState<WorkspacePresenceMeta>,
  members: WorkspaceMember[]
): PresenceUser[] {
  const usersById = new Map<string, PresenceUser>(
    members.map((member) => [
      member.userId,
      {
        userId: member.userId,
        role: member.role as PresenceUser["role"],
        status: "offline" as const,
        displayName: member.userId,
        avatarUrl: null,
      },
    ])
  );

  for (const presences of Object.values(state)) {
    for (const presence of presences) {
      const existing = usersById.get(presence.userId);

      if (!existing) {
        usersById.set(presence.userId, {
          userId: presence.userId,
          role: presence.role,
          status: presence.status === "away" ? "away" : "online",
          displayName: presence.displayName,
          avatarUrl: presence.avatarUrl,
        });
        continue;
      }

      usersById.set(presence.userId, {
        ...existing,
        role: presence.role,
        status: presence.status === "away" ? "away" : "online",
        displayName: presence.displayName,
        avatarUrl: presence.avatarUrl,
      });
    }
  }

  return Array.from(usersById.values());
}
