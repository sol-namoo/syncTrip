import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Plane } from "lucide-react";
import { ProfileMenu } from "@/features/auth/components/profile-menu";
import { createClient } from "@/lib/supabase/server";

export default async function MainLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/trips");
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-black/7 bg-[color:var(--color-bg-page)]">
        <div className="mx-auto flex h-17 max-w-6xl items-center justify-between px-6 lg:px-10">
          <Link href="/trips" className="flex items-center gap-2 text-2xl font-bold text-[color:var(--color-ink)]">
            <Plane className="size-8 text-[color:var(--color-primary)]" />
            <span>SyncTrip</span>
          </Link>
          <ProfileMenu
            email={user.email}
            fullName={user.user_metadata?.full_name ?? user.user_metadata?.name}
            avatarUrl={user.user_metadata?.avatar_url}
          />
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4.25rem)] w-full max-w-6xl flex-col px-6 py-10 lg:px-10">
        {children}
      </main>
    </div>
  );
}
