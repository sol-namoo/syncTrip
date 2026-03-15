export const collaborationColorTokens = [
  "emerald",
  "blue",
  "amber",
  "slate",
  "red",
  "violet",
  "cyan",
] as const

export type CollaborationColorToken = (typeof collaborationColorTokens)[number]

export const collaborationColorVarMap: Record<CollaborationColorToken, string> = {
  emerald: "var(--collab-emerald)",
  blue: "var(--collab-blue)",
  amber: "var(--collab-amber)",
  slate: "var(--collab-slate)",
  red: "var(--collab-red)",
  violet: "var(--collab-violet)",
  cyan: "var(--collab-cyan)",
}

export function getCollaborationColorValue(token: CollaborationColorToken = "blue") {
  return collaborationColorVarMap[token]
}
