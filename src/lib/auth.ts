export const authStateChangedEvent = "mm_auth_state_changed";

export function getStoredAuthState(): boolean {
  if (typeof window === "undefined") return false;

  const session = window.localStorage.getItem("mm_session");
  const isLoggedInFlag = window.localStorage.getItem("isLoggedIn");
  return Boolean(session) || isLoggedInFlag === "true";
}

export function emitAuthStateChanged(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(authStateChangedEvent));
}
