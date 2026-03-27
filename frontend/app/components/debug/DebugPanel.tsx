export default function DebugPanel({ data }: { data: unknown }) {
  return (
    <pre
      style={{
        position: "fixed",
        right: 12,
        bottom: 12,
        width: 320,
        maxHeight: 220,
        overflow: "auto",
        margin: 0,
        padding: 12,
        borderRadius: 12,
        border: "1px solid rgba(148, 163, 184, 0.18)",
        background: "rgba(2, 6, 23, 0.94)",
        color: "#86efac",
        fontSize: 11,
        lineHeight: 1.45,
        zIndex: 9999,
      }}
    >
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
