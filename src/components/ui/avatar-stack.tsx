import type { HTMLAttributes } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { CollaborationColorToken } from "@/lib/collaboration-colors"
import { cn } from "@/lib/utils"

const sizeClasses = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-sm",
} as const

export type AvatarStackSize = keyof typeof sizeClasses

export type AvatarStackStatus = "online" | "away" | "offline" | "editing"

export type AvatarStackUser = {
  id: string
  name: string
  src?: string | null
  color?: CollaborationColorToken
  status?: AvatarStackStatus
}

export type AvatarStackProps = HTMLAttributes<HTMLDivElement> & {
  users: AvatarStackUser[]
  size?: AvatarStackSize
  max?: number
}

function getInitials(name: string) {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((chunk) => chunk[0]?.toUpperCase())
      .join("") || "?"
  )
}

function getStatusLabel(user: AvatarStackUser) {
  switch (user.status) {
    case "away":
      return "자리 비움"
    case "offline":
      return "오프라인"
    case "editing":
      return "편집 중"
    case "online":
    default:
      return "접속 중"
  }
}

const avatarShells = [
  { bg: "#DCFCE7", fg: "#166534" },
  { bg: "#DBEAFE", fg: "#1D4ED8" },
  { bg: "#FEF3C7", fg: "#B45309" },
  { bg: "#F1F5F9", fg: "#475569" },
  { bg: "#FEE2E2", fg: "#B91C1C" },
  { bg: "#EDE9FE", fg: "#7C3AED" },
  { bg: "#CFFAFE", fg: "#0F766E" },
] as const

const avatarPaletteByToken: Record<CollaborationColorToken, (typeof avatarShells)[number]> = {
  emerald: avatarShells[0],
  blue: avatarShells[1],
  amber: avatarShells[2],
  slate: avatarShells[3],
  red: avatarShells[4],
  violet: avatarShells[5],
  cyan: avatarShells[6],
}

export function AvatarStack({
  className,
  users,
  size = "md",
  max = 4,
  ...props
}: AvatarStackProps) {
  const visibleUsers = users.slice(0, max)
  const remainingCount = Math.max(users.length - max, 0)

  return (
    <div className={cn("flex items-center", className)} {...props}>
      <div className="flex items-center pb-1">
        {visibleUsers.map((user, index) => (
          <div
            key={user.id}
            className={cn("relative", index > 0 && "-ml-3")}
            style={{ zIndex: index + 1 }}
            title={`${user.name} · ${getStatusLabel(user)}`}
          >
            <div
              className={cn(
                "rounded-full bg-white transition-[padding,opacity,filter,box-shadow] duration-200",
                user.status === "editing" ? "p-[3px] shadow-sm" : "p-[2px]",
                user.status === "away" && "opacity-60",
                user.status === "offline" && "grayscale opacity-45",
              )}
              style={{ backgroundColor: "white" }}
            >
              {(() => {
                const palette = user.color
                  ? avatarPaletteByToken[user.color]
                  : avatarShells[index % avatarShells.length]
                return (
              <Avatar className={cn("border-white bg-card shadow-sm", sizeClasses[size])}>
                {user.src ? <AvatarImage src={user.src} alt={user.name} /> : null}
                <AvatarFallback
                  className="font-semibold"
                  style={{ backgroundColor: palette.bg, color: palette.fg }}
                >
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
                )
              })()}
            </div>
          </div>
        ))}
      </div>

      {remainingCount > 0 ? (
        <div
          className={cn(
            "-ml-3 inline-flex items-center justify-center rounded-full border border-white bg-[color:var(--color-primary)] font-semibold text-[color:var(--color-primary-fg)] ring-2 ring-white",
            sizeClasses[size],
          )}
          style={{ zIndex: visibleUsers.length + 1 }}
          title={`${remainingCount}명 추가 접속 중`}
        >
          +{remainingCount}
        </div>
      ) : null}
    </div>
  )
}
