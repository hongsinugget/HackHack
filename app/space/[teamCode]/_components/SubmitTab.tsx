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

const inputStyle = (error?: string): React.CSSProperties => ({
  width: "100%", padding: "10px 14px", borderRadius: 8,
  background: "var(--bg-main, #f0f2f5)",
  border: `1px solid ${error ? "#ef4444" : "var(--border-subtle, #dde1e6)"}`,
  color: "var(--text-main, #12121a)", fontSize: 13, outline: "none",
  transition: "border-color 0.15s",
});

const labelStyle: React.CSSProperties = {
  fontSize: 12, color: "var(--text-muted, #6b6b80)", display: "block",
  marginBottom: 6, letterSpacing: "0.224px",
};

export default function SubmitTab({
  submission, isEnded,
  projectName, githubUrl, demoUrl, notes, selectedFile, subErrors,
  onProjectNameChange, onGithubUrlChange, onDemoUrlChange, onNotesChange, onFileChange, onSubmit,
}: SubmitTabProps) {
  if (submission) {
    return (
      <div>
        {/* 제출 완료 배너 */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "14px 16px", borderRadius: 12, marginBottom: "1.25rem",
          background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.25)",
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: "#10b981" }}>제출 완료</div>
            <div style={{ fontSize: 12, color: "var(--text-muted, #6b6b80)", marginTop: 2 }}>
              {new Date(submission.submittedAt).toLocaleString("ko-KR", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          </div>
        </div>

        {/* 제출 내용 */}
        <div style={{ background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)", borderRadius: 12, padding: 24, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "var(--text-main, #12121a)" }}>{submission.projectName}</div>
          <a
            href={submission.githubUrl}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", textDecoration: "none", fontWeight: 600 }}
          >
            GitHub →
          </a>
          <a
            href={submission.demoUrl}
            target="_blank" rel="noopener noreferrer"
            style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", textDecoration: "none", fontWeight: 600 }}
          >
            시연 링크 →
          </a>
          {submission.notes && (
            <div style={{ fontSize: 13, color: "var(--text-subtle, #4b5563)", padding: "10px 14px", background: "#ffffff", borderRadius: 8, border: "1px solid var(--border-subtle, #dde1e6)", lineHeight: "20px" }}>
              {submission.notes}
            </div>
          )}
          {submission.fileName && (
            <div style={{ fontSize: 13, color: "var(--text-muted, #6b6b80)" }}>
              첨부: {submission.fileName}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (isEnded) {
    return (
      <div style={{ textAlign: "center", padding: "4rem 1rem", color: "var(--text-muted, #6b6b80)" }}>
        <div style={{ fontWeight: 700, fontSize: 14, color: "var(--text-main, #12121a)", marginBottom: 6 }}>제출 마감</div>
        <div style={{ fontSize: 13 }}>대회가 종료되어 제출할 수 없습니다</div>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <label style={labelStyle}>프로젝트명 *</label>
        <input
          value={projectName}
          onChange={(e) => onProjectNameChange(e.target.value)}
          placeholder="프로젝트 이름을 입력해주세요"
          style={inputStyle(subErrors.projectName)}
          onFocus={(e) => { if (!subErrors.projectName) e.target.style.borderColor = "rgba(124,58,237,0.5)"; }}
          onBlur={(e) => { if (!subErrors.projectName) e.target.style.borderColor = "var(--border-subtle, #dde1e6)"; }}
        />
        {subErrors.projectName && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{subErrors.projectName}</div>}
      </div>

      <div>
        <label style={labelStyle}>GitHub URL *</label>
        <input
          value={githubUrl}
          onChange={(e) => onGithubUrlChange(e.target.value)}
          placeholder="https://github.com/..."
          style={inputStyle(subErrors.github)}
          onFocus={(e) => { if (!subErrors.github) e.target.style.borderColor = "rgba(124,58,237,0.5)"; }}
          onBlur={(e) => { if (!subErrors.github) e.target.style.borderColor = "var(--border-subtle, #dde1e6)"; }}
        />
        {subErrors.github && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{subErrors.github}</div>}
      </div>

      <div>
        <label style={labelStyle}>시연 URL *</label>
        <input
          value={demoUrl}
          onChange={(e) => onDemoUrlChange(e.target.value)}
          placeholder="https://..."
          style={inputStyle(subErrors.demo)}
          onFocus={(e) => { if (!subErrors.demo) e.target.style.borderColor = "rgba(124,58,237,0.5)"; }}
          onBlur={(e) => { if (!subErrors.demo) e.target.style.borderColor = "var(--border-subtle, #dde1e6)"; }}
        />
        {subErrors.demo && <div style={{ fontSize: 11, color: "#ef4444", marginTop: 4 }}>{subErrors.demo}</div>}
      </div>

      <div>
        <label style={labelStyle}>
          메모 <span style={{ fontWeight: 400 }}>(선택)</span>
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="심사위원이나 팀원에게 전달할 메모를 남겨주세요"
          rows={3}
          style={{ ...inputStyle(), resize: "vertical" }}
          onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
          onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle, #dde1e6)")}
        />
      </div>

      <div>
        <label style={labelStyle}>
          서비스 소개서 <span style={{ fontWeight: 400 }}>(PDF/PPTX, 선택)</span>
        </label>
        <label style={{
          display: "flex", alignItems: "center", gap: 10, padding: "10px 14px",
          borderRadius: 8, cursor: "pointer",
          background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)",
        }}>
          <input type="file" accept=".pdf,.pptx,.ppt" style={{ display: "none" }} onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
          <span style={{ fontSize: 13, color: "var(--brand-primary, #7c3aed)", fontWeight: 600, flexShrink: 0 }}>파일 선택</span>
          <span style={{ fontSize: 13, color: selectedFile ? "var(--text-main, #12121a)" : "var(--text-muted, #6b6b80)", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {selectedFile ? selectedFile.name : "PDF 또는 PPTX 파일"}
          </span>
          {selectedFile && (
            <button
              onClick={(e) => { e.preventDefault(); onFileChange(null); }}
              style={{ background: "none", border: "none", color: "var(--text-muted, #6b6b80)", cursor: "pointer", fontSize: 13, flexShrink: 0 }}
            >
              ✕
            </button>
          )}
        </label>
      </div>

      <button
        onClick={onSubmit}
        className="btn-primary"
        style={{ padding: "12px", fontSize: 14, borderRadius: 8 }}
      >
        제출하기
      </button>
    </div>
  );
}
