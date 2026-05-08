"use client";

import { useState } from "react";
import type { AuthResponse, DocumentRecord, RecommendOutput } from "@reel-trip/types";
import type { ApiResponse } from "@reel-trip/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

async function call<T>(path: string, init?: RequestInit, token?: string): Promise<ApiResponse<T>> {
  const headers = new Headers(init?.headers);
  if (!headers.has("Content-Type") && init?.body) headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });
  return res.json();
}

export default function TestUiPage() {
  const [token, setToken] = useState("");
  const [signupForm, setSignupForm] = useState({ username: "", email: "", password: "" });
  const [loginForm, setLoginForm] = useState({ username: "", password: "" });
  const [documentForm, setDocumentForm] = useState({ title: "", content: "" });
  const [documentId, setDocumentId] = useState("");
  const [searchEmbedding, setSearchEmbedding] = useState("0.1,0.2,0.3");
  const [recommendQuery, setRecommendQuery] = useState("");
  const [log, setLog] = useState("Ready");

  const appendLog = (label: string, payload: unknown) =>
    setLog(`${label}\n${JSON.stringify(payload, null, 2)}`);

  const handleSignup = async () => {
    const result = await call<AuthResponse>("/api/auth/signup", { method: "POST", body: JSON.stringify(signupForm) });
    if (result.success && result.data) setToken(result.data.accessToken);
    appendLog("signup", result);
  };

  const handleLogin = async () => {
    const result = await call<AuthResponse>("/api/auth/login", { method: "POST", body: JSON.stringify(loginForm) });
    if (result.success && result.data) setToken(result.data.accessToken);
    appendLog("login", result);
  };

  const handleCreateDocument = async () => {
    const result = await call<{ id: string }>("/api/documents", { method: "POST", body: JSON.stringify(documentForm) }, token);
    appendLog("createDocument", result);
  };

  const handleListDocuments = async () => {
    const result = await call<DocumentRecord[]>("/api/documents", undefined, token);
    appendLog("listDocuments", result);
  };

  const handleGetDocument = async () => {
    const result = await call<DocumentRecord>(`/api/documents/${documentId}`, undefined, token);
    appendLog("getDocument", result);
  };

  const handleUpdateDocument = async () => {
    const result = await call<null>(`/api/documents/${documentId}`, { method: "PUT", body: JSON.stringify(documentForm) }, token);
    appendLog("updateDocument", result);
  };

  const handleDeleteDocument = async () => {
    const result = await call<null>(`/api/documents/${documentId}`, { method: "DELETE" }, token);
    appendLog("deleteDocument", result);
  };

  const handleSearchDocuments = async () => {
    const embedding = searchEmbedding.split(",").map((v) => Number(v.trim())).filter((v) => !isNaN(v));
    const result = await call<DocumentRecord[]>("/api/documents/search", { method: "POST", body: JSON.stringify({ embedding, limit: 5, threshold: 0 }) }, token);
    appendLog("searchDocuments", result);
  };

  const handleRecommend = async () => {
    const result = await call<RecommendOutput>("/api/recommend", { method: "POST", body: JSON.stringify({ query: recommendQuery, topK: 5, threshold: 0.5 }) });
    appendLog("recommend", result);
  };

  return (
    <main style={styles.page}>
      <section style={styles.hero}>
        <p style={styles.kicker}>ReeL-Trip</p>
        <h1 style={styles.title}>API Test UI</h1>
        <p style={{ fontSize: 12, color: "#64748b", margin: "4px 0 0" }}>{API_BASE}</p>
      </section>

      <section style={styles.grid}>
        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Auth</h2>
          <input style={styles.input} placeholder="username" value={signupForm.username} onChange={(e) => setSignupForm((p) => ({ ...p, username: e.target.value }))} />
          <input style={styles.input} placeholder="email" value={signupForm.email} onChange={(e) => setSignupForm((p) => ({ ...p, email: e.target.value }))} />
          <input style={styles.input} placeholder="password" type="password" value={signupForm.password} onChange={(e) => setSignupForm((p) => ({ ...p, password: e.target.value }))} />
          <button style={styles.button} onClick={handleSignup}>Signup</button>
          <hr style={{ margin: "14px 0", border: "none", borderTop: "1px solid #e2e8f0" }} />
          <input style={styles.input} placeholder="username" value={loginForm.username} onChange={(e) => setLoginForm((p) => ({ ...p, username: e.target.value }))} />
          <input style={styles.input} placeholder="password" type="password" value={loginForm.password} onChange={(e) => setLoginForm((p) => ({ ...p, password: e.target.value }))} />
          <button style={styles.buttonSecondary} onClick={handleLogin}>Login</button>
          <textarea style={{ ...styles.textarea, marginTop: 12 }} value={token} onChange={(e) => setToken(e.target.value)} placeholder="JWT token" rows={3} />
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Documents</h2>
          <input style={styles.input} placeholder="title" value={documentForm.title} onChange={(e) => setDocumentForm((p) => ({ ...p, title: e.target.value }))} />
          <textarea style={styles.textarea} placeholder="content" value={documentForm.content} onChange={(e) => setDocumentForm((p) => ({ ...p, content: e.target.value }))} rows={4} />
          <div style={styles.row}>
            <button style={styles.button} onClick={handleCreateDocument}>Create</button>
            <button style={styles.buttonSecondary} onClick={handleListDocuments}>List</button>
          </div>
          <input style={styles.input} placeholder="document id" value={documentId} onChange={(e) => setDocumentId(e.target.value)} />
          <div style={styles.row}>
            <button style={styles.buttonSecondary} onClick={handleGetDocument}>Get</button>
            <button style={styles.buttonSecondary} onClick={handleUpdateDocument}>Update</button>
            <button style={styles.buttonDanger} onClick={handleDeleteDocument}>Delete</button>
          </div>
        </div>

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>Search & Recommend</h2>
          <textarea style={styles.textarea} placeholder="0.1,0.2,0.3" value={searchEmbedding} onChange={(e) => setSearchEmbedding(e.target.value)} rows={4} />
          <button style={styles.button} onClick={handleSearchDocuments}>Vector Search</button>
          <input style={{ ...styles.input, marginTop: 12 }} placeholder="recommend query" value={recommendQuery} onChange={(e) => setRecommendQuery(e.target.value)} />
          <button style={styles.buttonSecondary} onClick={handleRecommend}>Recommend</button>
        </div>
      </section>

      <section style={styles.logCard}>
        <h2 style={{ ...styles.cardTitle, color: "#e2e8f0" }}>Response</h2>
        <pre style={styles.log}>{log}</pre>
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: "100vh", padding: "40px 24px 64px", background: "radial-gradient(circle at top, #f5d0fe 0%, #f8fafc 30%, #e2e8f0 100%)", color: "#111827", fontFamily: "Georgia, serif" },
  hero: { maxWidth: 1100, margin: "0 auto 24px" },
  kicker: { margin: 0, letterSpacing: "0.2em", textTransform: "uppercase", color: "#9a3412", fontSize: 12 },
  title: { margin: "8px 0", fontSize: 52, lineHeight: 1 },
  grid: { maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 },
  card: { background: "rgba(255,255,255,0.8)", border: "1px solid rgba(148,163,184,0.35)", borderRadius: 24, padding: 20, backdropFilter: "blur(12px)" },
  logCard: { maxWidth: 1100, margin: "16px auto 0", background: "#0f172a", borderRadius: 24, padding: 20 },
  cardTitle: { margin: "0 0 14px", fontSize: 24 },
  input: { width: "100%", marginBottom: 10, padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", boxSizing: "border-box" },
  textarea: { width: "100%", marginBottom: 10, padding: "12px 14px", borderRadius: 14, border: "1px solid #cbd5e1", boxSizing: "border-box", resize: "vertical" },
  row: { display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 },
  button: { padding: "12px 16px", border: "none", borderRadius: 999, background: "#0f172a", color: "#fff", cursor: "pointer" },
  buttonSecondary: { padding: "12px 16px", border: "none", borderRadius: 999, background: "#ea580c", color: "#fff", cursor: "pointer" },
  buttonDanger: { padding: "12px 16px", border: "none", borderRadius: 999, background: "#be123c", color: "#fff", cursor: "pointer" },
  log: { overflowX: "auto", whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, color: "#e2e8f0" },
};
