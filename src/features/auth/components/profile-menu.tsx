"use client";

import { LogOut } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

type ProfileMenuProps = {
  email?: string | null;
  fullName?: string | null;
  avatarUrl?: string | null;
};

function getInitials(name?: string | null, email?: string | null) {
  const source = name?.trim() || email?.trim() || "?";
  const parts = source.split(/[\s@._-]+/).filter(Boolean);

  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function ProfileMenu({ email, fullName, avatarUrl }: ProfileMenuProps) {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handlePointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  async function handleSignOut() {
    setPending(true);
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        className="rounded-full transition-opacity hover:opacity-90"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Avatar className="size-10 border-white shadow-sm">
          {avatarUrl ? <AvatarImage src={avatarUrl} alt={fullName ?? email ?? "User avatar"} /> : null}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(fullName, email)}
          </AvatarFallback>
        </Avatar>
      </button>

      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-3 w-60 rounded-2xl border border-border bg-card p-2 shadow-[0_16px_40px_rgba(15,23,42,0.12)]"
        >
          <div className="rounded-xl px-3 py-2">
            <p className="text-sm font-semibold text-foreground">{fullName || "SyncTrip User"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <div className="my-2 h-px bg-border" />
          <Button
            type="button"
            variant="ghost"
            className="h-10 w-full justify-start rounded-xl px-3"
            onClick={handleSignOut}
            disabled={pending}
          >
            <LogOut className="size-4" />
            로그아웃
          </Button>
        </div>
      ) : null}
    </div>
  );
}
