const BLOCKED_TERMS = ["stupid", "idiot", "dumb", "hate", "kill", "loser"];

export function containsFlaggedLanguage(input: string): boolean {
  const normalized = input.toLowerCase();
  return BLOCKED_TERMS.some((term) => normalized.includes(term));
}

export function sanitizeText(input: string): string {
  let next = input;
  for (const term of BLOCKED_TERMS) {
    const pattern = new RegExp(term, "gi");
    next = next.replace(pattern, "*".repeat(term.length));
  }
  return next;
}
