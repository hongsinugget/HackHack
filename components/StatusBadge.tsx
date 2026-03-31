import type { HackathonStatus } from "@/lib/types";
import { statusLabel } from "@/lib/utils";

export default function StatusBadge({ status }: { status: HackathonStatus }) {
  return (
    <span className={`badge badge-${status}`}>
      {status === "ongoing" && "● "}
      {statusLabel(status)}
    </span>
  );
}
