type Notice = { id: string; text: string; createdAt: string };

interface NoticesTabProps {
  notices: Notice[];
  noticeInput: string;
  isEnded: boolean;
  onInputChange: (value: string) => void;
  onAdd: () => void;
  onDelete: (id: string) => void;
}

export default function NoticesTab({ notices, noticeInput, isEnded, onInputChange, onAdd, onDelete }: NoticesTabProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {!isEnded && (
        <div style={{ display: "flex", gap: 8 }}>
          <input
            value={noticeInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            placeholder="공지 내용을 입력하세요 (Enter)"
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8,
              background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)",
              color: "var(--text-main, #12121a)", fontSize: 13, outline: "none",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => (e.target.style.borderColor = "rgba(124,58,237,0.5)")}
            onBlur={(e) => (e.target.style.borderColor = "var(--border-subtle, #dde1e6)")}
          />
          <button
            onClick={onAdd}
            className="btn-primary"
            style={{ whiteSpace: "nowrap", fontSize: 13 }}
          >
            등록
          </button>
        </div>
      )}

      {notices.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--text-muted, #6b6b80)", fontSize: 13 }}>
          등록된 공지가 없습니다
        </div>
      ) : (
        notices.map((n) => (
          <div
            key={n.id}
            style={{
              display: "flex", alignItems: "flex-start", gap: 12,
              padding: "14px 16px", borderRadius: 10,
              background: "var(--bg-main, #f0f2f5)", border: "1px solid var(--border-subtle, #dde1e6)",
            }}
          >
            <span style={{ color: "var(--brand-primary, #7c3aed)", fontSize: 13, flexShrink: 0, marginTop: 2, fontWeight: 700 }}>•</span>
            <span style={{ flex: 1, fontSize: 13, lineHeight: "20px", color: "var(--text-main, #12121a)" }}>{n.text}</span>
            <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
              <span style={{ fontSize: 11, color: "var(--text-muted, #6b6b80)", letterSpacing: "0.224px" }}>
                {new Date(n.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              </span>
              {!isEnded && (
                <button
                  onClick={() => onDelete(n.id)}
                  style={{
                    padding: "2px 8px", borderRadius: 4, fontSize: 11,
                    background: "transparent", border: "1px solid var(--border-subtle, #dde1e6)",
                    color: "var(--text-muted, #6b6b80)", cursor: "pointer",
                  }}
                >
                  삭제
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
