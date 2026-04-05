export function formatPrize(krw: number): string {
  if (krw >= 10_000_000) return `${krw / 10_000_000}천만원`;
  if (krw >= 1_000_000) return `${krw / 1_000_000}백만원`;
  if (krw >= 10_000) return `${Math.floor(krw / 10_000)}만원`;
  return `${krw.toLocaleString()}원`;
}

export function dDayLabel(deadlineAt: string): string {
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "마감";
  if (diffDays === 0) return "D-Day";
  return `D-${diffDays}`;
}

export function isRushMode(deadlineAt: string): boolean {
  const now = new Date();
  const deadline = new Date(deadlineAt);
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= 3;
}

export function statusLabel(status: string): string {
  if (status === "ongoing") return "진행중";
  if (status === "upcoming") return "예정";
  return "종료";
}

export function computeStatus(period: { startAt: string; submissionDeadlineAt: string }): "ongoing" | "upcoming" | "ended" {
  const now = new Date();
  if (now < new Date(period.startAt)) return "upcoming";
  if (now <= new Date(period.submissionDeadlineAt)) return "ongoing";
  return "ended";
}
