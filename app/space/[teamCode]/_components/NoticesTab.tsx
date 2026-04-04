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
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {!isEnded && (
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <input
            value={noticeInput}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onAdd()}
            placeholder="공지 내용을 입력하세요 (Enter)"
            style={{
              flex: 1, padding: "0.625rem 0.875rem", borderRadius: 8,
              background: "var(--surface2)", border: "1px solid var(--border)",
              color: "var(--text)", fontSize: "0.875rem", outline: "none",
            }}
          />
          <button
            onClick={onAdd}
            style={{ padding: "0.625rem 1rem", borderRadius: 8, fontWeight: 700, background: "var(--accent)", color: "#fff", border: "none", fontSize: "0.875rem", cursor: "pointer", whiteSpace: "nowrap" }}
          >
            등록
          </button>
        </div>
      )}
      {notices.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 1rem", color: "var(--muted)", fontSize: "0.875rem" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>📭</div>
          등록된 공지가 없습니다
        </div>
      ) : (
        notices.map((n) => (
          <div key={n.id} style={{
            display: "flex", alignItems: "flex-start", gap: "0.75rem",
            padding: "0.875rem 1rem", borderRadius: 10,
            background: "var(--surface)", border: "1px solid var(--border)",
          }}>
            <span style={{ color: "#a78bfa", fontSize: "0.8rem", flexShrink: 0, marginTop: 3 }}>•</span>
            <span style={{ flex: 1, fontSize: "0.875rem", lineHeight: 1.6 }}>{n.text}</span>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
              <span style={{ fontSize: "0.7rem", color: "var(--muted)" }}>
                {new Date(n.createdAt).toLocaleDateString("ko-KR", { month: "short", day: "numeric" })}
              </span>
              {!isEnded && (
                <button
                  onClick={() => onDelete(n.id)}
                  style={{ padding: "2px 8px", borderRadius: 4, fontSize: "0.72rem", background: "transparent", border: "1px solid var(--border)", color: "var(--muted)", cursor: "pointer" }}
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
