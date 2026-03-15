import type { ReactNode } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
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
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/80 bg-white">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6 lg:px-10">
          <Link href="/trips" className="text-2xl font-semibold tracking-tight">
            SyncTrip
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
