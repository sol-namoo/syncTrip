import type { ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-[68px] max-w-6xl items-center justify-between px-6 lg:px-10">
          <div className="text-2xl font-semibold tracking-tight">SyncTrip</div>
          <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            김
          </div>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4.25rem)] w-full max-w-6xl flex-col px-6 py-10 lg:px-10">
        {children}
      </main>
    </div>
  );
}
