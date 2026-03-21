const baseCollaborationColors = {
  teal: "#0F766E",
  amber: "#D97706",
  violet: "#7C3AED",
  red: "#DC2626",
  slate: "#475569",
  olive: "#4D7C0F",
} as const

export const collaborationColorTokens = [
  "teal",
  "amber",
  "violet",
  "red",
  "slate",
  "olive",
] as const

export type CollaborationColorToken = (typeof collaborationColorTokens)[number]
export type CollaborationColorVariant = (typeof variantProfiles)[number]["suffix"]

export type CollaborationResolvedColor = {
  id: string
  token: CollaborationColorToken
  variant: CollaborationColorVariant
  solid: string
  soft: string
  avatarBg: string
  avatarFg: string
}

const variantProfiles = [
  { suffix: "base", bgMix: 0.82, fgMix: 0.12, softAlpha: 0.16 },
  { suffix: "soft", bgMix: 0.74, fgMix: 0.18, softAlpha: 0.2 },
  { suffix: "bright", bgMix: 0.88, fgMix: 0.22, softAlpha: 0.14 },
  { suffix: "deep", bgMix: 0.66, fgMix: 0.08, softAlpha: 0.24 },
  { suffix: "mist", bgMix: 0.9, fgMix: 0.28, softAlpha: 0.12 },
] as const

function hashString(value: string) {
  let hash = 5381

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }

  return Math.abs(hash >>> 0)
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "")
  const value = Number.parseInt(normalized, 16)

  return {
    r: (value >> 16) & 255,
    g: (value >> 8) & 255,
    b: value & 255,
  }
}

function rgbToHex(rgb: { r: number; g: number; b: number }) {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((channel) => Math.max(0, Math.min(255, Math.round(channel))).toString(16).padStart(2, "0"))
    .join("")}`
}

function mixHex(baseHex: string, targetHex: string, amount: number) {
  const base = hexToRgb(baseHex)
  const target = hexToRgb(targetHex)

  return rgbToHex({
    r: base.r + (target.r - base.r) * amount,
    g: base.g + (target.g - base.g) * amount,
    b: base.b + (target.b - base.b) * amount,
  })
}

function alphaHex(baseHex: string, alpha: number) {
  const { r, g, b } = hexToRgb(baseHex)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

const collaborationPalette = variantProfiles.flatMap((profile) =>
  collaborationColorTokens.map((token) => {
    const solid = baseCollaborationColors[token]
    return {
      id: `${token}-${profile.suffix}`,
      token,
      variant: profile.suffix,
      solid,
      soft: alphaHex(solid, profile.softAlpha),
      avatarBg: mixHex(solid, "#FFFFFF", profile.bgMix),
      avatarFg: mixHex(solid, "#0F172A", profile.fgMix),
    } satisfies CollaborationResolvedColor
  })
)

const collaborationPaletteByCompositeKey = new Map(
  collaborationPalette.map((entry) => [`${entry.token}:${entry.variant}`, entry] as const)
)

export function getCollaborationPaletteByToken(
  token: CollaborationColorToken = "teal"
): CollaborationResolvedColor {
  return collaborationPalette.find((entry) => entry.token === token) ?? collaborationPalette[0]
}

export function getCollaborationPalette(
  token?: CollaborationColorToken | null,
  variant?: CollaborationColorVariant | null
): CollaborationResolvedColor {
  if (!token || !variant) {
    return collaborationPalette[0]
  }

  return collaborationPaletteByCompositeKey.get(`${token}:${variant}`) ?? collaborationPalette[0]
}

export function assignCollaborationColors(keys: string[]) {
  const uniqueKeys = Array.from(new Set(keys)).sort()
  const assignments = new Map<string, CollaborationResolvedColor>()
  const usedPaletteIds = new Set<string>()

  for (const key of uniqueKeys) {
    const startIndex = hashString(key) % collaborationPalette.length
    let assigned: CollaborationResolvedColor | null = null

    for (let offset = 0; offset < collaborationPalette.length; offset += 1) {
      const candidate = collaborationPalette[(startIndex + offset) % collaborationPalette.length]

      if (!usedPaletteIds.has(candidate.id)) {
        assigned = candidate
        break
      }
    }

    assignments.set(key, assigned ?? collaborationPalette[startIndex])
    if (assigned) {
      usedPaletteIds.add(assigned.id)
    }
  }

  return assignments
}
