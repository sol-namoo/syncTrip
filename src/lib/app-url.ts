function trimTrailingSlash(value: string) {
  return value.replace(/\/+$/, "");
}

export function getPublicAppUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (configuredUrl) {
    return trimTrailingSlash(configuredUrl);
  }

  if (typeof window !== "undefined" && window.location.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return "http://localhost:3000";
}

export function buildShareUrl(shareCode: string) {
  return `${getPublicAppUrl()}/share/${shareCode}`;
}
