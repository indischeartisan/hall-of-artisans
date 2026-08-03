export default function AcademyRouteFallback() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: "2rem", background: "#f4ead7", color: "#173c32", fontFamily: "Georgia, 'Times New Roman', serif" }}
    >
      <p>Opening The Academy…</p>
    </main>
  );
}
