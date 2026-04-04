import type { Team, Hackathon } from "@/lib/types";

type TeamSubmission = {
  projectName: string; githubUrl: string; demoUrl: string;
  notes?: string; fileName?: string; submittedAt: string; teamName: string;
};

interface SubmitTabProps {
  team: Team;
  hackathon: Hackathon | null;
  submission: TeamSubmission | null;
  isEnded: boolean;
  projectName: string;
  githubUrl: string;
  demoUrl: string;
  notes: string;
  selectedFile: File | null;
  subErrors: Record<string, string>;
  onProjectNameChange: (v: string) => void;
  onGithubUrlChange: (v: string) => void;
  onDemoUrlChange: (v: string) => void;
  onNotesChange: (v: string) => void;
  onFileChange: (file: File | null) => void;
  onSubmit: () => void;
}

export default function SubmitTab({
  submission, isEnded,
  projectName, githubUrl, demoUrl, notes, selectedFile, subErrors,
  onProjectNameChange, onGithubUrlChange, onDemoUrlChange, onNotesChange, onFileChange, onSubmit,
}: SubmitTabProps) {
  if (submission) {
    return (
      <div>
        <div style={{
          display: "flex", alignItems: "center", gap: "0.875rem",
          padding: "1.1rem 1.25rem", borderRadius: 12, marginBottom: "1.25rem",
          background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.25)",
        }}>
          <span style={{ fontSize: "1.75rem" }}>🎉</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "1rem", color: "#10b981" }}>제출 완료</div>
            <div style={{ fontSize: "0.775rem", color: "var(--muted)" }}>
              {new Date(submission.submittedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>
        <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          <div style={{ fontSize: "1rem", fontWeight: 700, color: "var(--text)", marginBottom: "0.25rem" }}>{submission.projectName}</div>
          <a href={submission.githubUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#a78bfa", textDecoration: "none" }}>🔗 GitHub</a>
          <a href={submission.demoUrl} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "#a78bfa", textDecoration: "none" }}>🌐 시연 링크</a>
          {submission.notes && <div style={{ fontSize: "0.85rem", color: "var(--muted)", padding: "0.625rem 0.875rem", background: "var(--surface2)", borderRadius: 8, border: "1px solid var(--border)", lineHeight: 1.6 }}>{submission.notes}</div>}
          {submission.fileName && <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.875rem", color: "var(--muted)" }}>📄 {submission.fileName}</div>}
        </div>
      </div>
    );
  }

  if (isEnded) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--muted)" }}>
        <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🔒</div>
        <div style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.375rem" }}>제출 마감</div>
        <div style={{ fontSize: "0.85rem" }}>대회가 종료되어 제출할 수 없습니다</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>프로젝트명 *</label>
        <input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="프로젝트 이름을 입력해주세요"
          style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: `1px solid ${subErrors.projectName ? "#ef4444" : "var(--border)"}`, color: "var(--text)", fontSize: "0.875rem", outline: "none" }}
        />
        {subErrors.projectName && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.projectName}</div>}
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>GitHub URL *</label>
        <input
          value={githubUrl}
          onChange={(e) => onGithubUrlChange(e.target.value)}
          placeholder="https://github.com/..."
          style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: `1px solid ${subErrors.github ? "#ef4444" : "var(--border)"}`, color: "var(--text)", fontSize: "0.875rem", outline: "none" }}
        />
        {subErrors.github && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.github}</div>}
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>시연 URL *</label>
        <input
          value={demoUrl}
          onChange={(e) => onDemoUrlChange(e.target.value)}
          placeholder="https://..."
          style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: `1px solid ${subErrors.demo ? "#ef4444" : "var(--border)"}`, color: "var(--text)", fontSize: "0.875rem", outline: "none" }}
        />
        {subErrors.demo && <div style={{ fontSize: "0.75rem", color: "#ef4444", marginTop: 4 }}>{subErrors.demo}</div>}
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>
          메모 <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>(선택)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="심사위원이나 팀원에게 전달할 메모를 남겨주세요"
          rows={3}
          style={{ width: "100%", padding: "0.625rem 0.875rem", borderRadius: 8, background: "var(--surface2)", border: "1px solid var(--border)", color: "var(--text)", fontSize: "0.875rem", resize: "vertical", outline: "none" }}
        />
      </div>
      <div>
        <label style={{ fontSize: "0.8rem", color: "var(--muted)", display: "block", marginBottom: 5 }}>
          서비스 소개서 <span style={{ fontSize: "0.75rem", fontWeight: 400 }}>(PDF/PPTX, 선택)</span>
        </label>
        <label style={{ display: "flex", alignItems: "center", gap: "0.625rem", padding: "0.625rem 0.875rem", borderRadius: 8, cursor: "pointer", background: "var(--surface2)", border: "1px solid var(--border)" }}>
          <input type="file" accept=".pdf,.pptx,.ppt" style={{ display: "none" }} onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
          <span style={{ fontSize: "0.85rem", color: "var(--accent)" }}>📎 파일 선택</span>
          <span style={{ fontSize: "0.8rem", color: selectedFile ? "var(--text)" : "var(--muted)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedFile ? selectedFile.name : "PDF 또는 PPTX 파일"}
          </span>
          {selectedFile && (
            <button onClick={(e) => { e.preventDefault(); onFileChange(null); }} style={{ background: "none", border: "none", color: "var(--muted)", cursor: "pointer", fontSize: "0.85rem", flexShrink: 0 }}>✕</button>
          )}
        </label>
      </div>
      <button
        onClick={onSubmit}
        style={{ padding: "0.75rem", borderRadius: 8, fontWeight: 700, fontSize: "0.95rem", background: "var(--accent)", color: "#fff", border: "none", cursor: "pointer" }}
      >
        🚀 제출하기
      </button>
    </div>
  );
}
