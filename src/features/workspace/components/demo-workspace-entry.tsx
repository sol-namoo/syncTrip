"use client";

import { useEffect, useMemo, useState } from "react";
import { WorkspaceScreen } from "@/features/workspace/components/workspace-screen";
import { buildWorkspaceActor } from "@/features/workspace/lib/access";
import { createClient } from "@/lib/supabase/client";
import type { WorkspaceActor, WorkspaceSnapshot } from "@/types/workspace";

function getDemoDisplayName(userId?: string) {
  if (!userId) {
    return "Demo User";
  }

  return `Demo ${userId.slice(0, 4).toUpperCase()}`;
}

function buildDemoActor(user: {
  id?: string;
  email?: string;
  fullName?: string;
  avatarUrl?: string;
} | null): WorkspaceActor {
  return buildWorkspaceActor({
    role: "demo",
    user,
  });
}

export function DemoWorkspaceEntry({
  snapshot,
}: {
  snapshot: WorkspaceSnapshot;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [actor, setActor] = useState<WorkspaceActor | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function ensureDemoSession() {
      const {
        data: { user: existingUser },
      } = await supabase.auth.getUser();

      if (isCancelled) {
        return;
      }

      if (existingUser) {
        setActor(
          buildDemoActor({
            id: existingUser.id,
            email: existingUser.email,
            fullName:
              existingUser.user_metadata?.full_name ??
              existingUser.user_metadata?.name ??
              getDemoDisplayName(existingUser.id),
            avatarUrl: existingUser.user_metadata?.avatar_url,
          })
        );
        return;
      }

      const { data, error } = await supabase.auth.signInAnonymously({
        options: {
          data: {
            full_name: "Demo User",
            name: "Demo User",
          },
        },
      });

      if (isCancelled) {
        return;
      }

      if (error || !data.user) {
        setActor(
          buildDemoActor({
            id: undefined,
            email: "demo@synctrip.local",
            fullName: "Demo User",
            avatarUrl: undefined,
          })
        );
        return;
      }

      setActor(
        buildDemoActor({
          id: data.user.id,
          email: data.user.email,
          fullName:
            (data.user.user_metadata?.full_name &&
            data.user.user_metadata?.full_name !== "Demo User"
              ? data.user.user_metadata?.full_name
              : undefined) ??
            (data.user.user_metadata?.name && data.user.user_metadata?.name !== "Demo User"
              ? data.user.user_metadata?.name
              : undefined) ??
            getDemoDisplayName(data.user.id),
          avatarUrl: data.user.user_metadata?.avatar_url,
        })
      );
    }

    void ensureDemoSession();

    return () => {
      isCancelled = true;
    };
  }, [supabase]);

  if (!actor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[color:var(--color-bg-page)] text-sm text-muted-foreground">
        데모 워크스페이스를 준비하고 있습니다...
      </div>
    );
  }

  return <WorkspaceScreen snapshot={snapshot} tripId="demo" actor={actor} />;
}
