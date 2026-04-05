import type { HackathonStatus } from "@/lib/types";
import { statusLabel } from "@/lib/utils";

type Props = { status: HackathonStatus; variant?: "default" | "card" };

export default function StatusBadge({ status, variant = "default" }: Props) {
  if (variant === "card") {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          padding: "4px 8px",
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: "0.224px",
          background: "#5013ba",
          color: "var(--text-light, #f0f2f5)",
        }}
      >
        {statusLabel(status)}
      </span>
    );
  }
  return (
    <span className={`badge badge-${status}`}>
      {statusLabel(status)}
    </span>
  );
}
