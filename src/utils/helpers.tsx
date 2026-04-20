// src/utils/helpers.ts
export function levenshtein(a: string, b: string): number {
  a = a.toLowerCase();
  b = b.toLowerCase();
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      dp[i][j] =
        a[i - 1] === b[j - 1]
          ? dp[i - 1][j - 1]
          : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[a.length][b.length];
}

export function formatHint(word: string): string {
  const parts = word.split(" ");
  return parts
    .map((p) => {
      if (p.length <= 1) return p;
      if (p.length === 2) return p[0] + "_";
      return p[0] + "_".repeat(p.length - 2) + p[p.length - 1];
    })
    .join("  ");
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function genRoomCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
  return Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join("");
}

export function genPlayerId(): string {
  return "p_" + Math.random().toString(36).slice(2, 10);
}

export const PLAYER_COLORS = [
  "#FF4D00",
  "#FF9A00",
  "#2FB36D",
  "#4A9EFF",
  "#C859FF",
  "#FF59A4",
  "#59FFDC",
  "#FFD700",
];
